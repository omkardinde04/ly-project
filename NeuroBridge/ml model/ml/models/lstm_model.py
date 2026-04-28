"""
lstm_model.py
--------------
Phase 2 of the NeuroBridge adaptive ML system.

What it does:
  - Takes a SEQUENCE of session feature vectors (T sessions × 14 features)
  - Also takes the user's CURRENT adaptive params (8 values)
  - Outputs DELTA values for each param (how much to nudge each one)
  - The delta is constrained to safe ranges so the UI never jumps harshly

Architecture:
  Input  → (batch, T, 14)       — last T sessions of behavioral data
  LSTM1  → hidden_size=64, dropout=0.2
  LSTM2  → hidden_size=32, dropout=0.2
  Concat → LSTM output (32) + current_params (7) = 39
  FC1    → 39 → 32, ReLU
  FC2    → 32 → 7,  Tanh   ← one delta per adaptive parameter
  Output → (batch, 7)           — scaled deltas, clamped to max step size

Usage:
    from ml.models.lstm_model import AdaptiveParamLSTM, apply_deltas
    model  = AdaptiveParamLSTM()
    deltas = model(session_seq, current_params)
    new_params = apply_deltas(current_params, deltas)
"""

import torch
import torch.nn as nn
import numpy as np


# ─── Parameter definitions ────────────────────────────────────────────────────

PARAM_KEYS = [
    "font_size",
    "letter_spacing",
    "line_height",
    "mask_opacity",
    "content_difficulty",
    "read_aloud_dependency",
    "font_family_stage",
]

PARAM_SAFE_RANGES = {
    "font_size":             (16.0, 48.0),
    "letter_spacing":        (0.0,  0.20),
    "line_height":           (1.4,  2.2),
    "mask_opacity":          (0.0,  1.0),
    "content_difficulty":    (1.0,  10.0),
    "read_aloud_dependency": (0.0,  1.0),
    "font_family_stage":     (0.0,  2.0),
}

# Maximum change per session — keeps UI changes gentle, never jarring
MAX_DELTA_PER_SESSION = {
    "font_size":             2.0,
    "letter_spacing":        0.010,
    "line_height":           0.08,
    "mask_opacity":          0.08,
    "content_difficulty":    0.5,
    "read_aloud_dependency": 0.08,
    "font_family_stage":     0.3,
}

# For normalising params into [0,1] before feeding to the model
def normalise_params(params_dict):
    """Convert params dict → normalised numpy array (7,) in [0,1]"""
    vec = []
    for k in PARAM_KEYS:
        lo, hi = PARAM_SAFE_RANGES[k]
        v = (params_dict[k] - lo) / (hi - lo + 1e-8)
        vec.append(float(np.clip(v, 0.0, 1.0)))
    return np.array(vec, dtype=np.float32)

def denormalise_params(vec):
    """Convert normalised numpy array (7,) back to params dict"""
    params = {}
    for i, k in enumerate(PARAM_KEYS):
        lo, hi = PARAM_SAFE_RANGES[k]
        params[k] = float(vec[i] * (hi - lo) + lo)
    return params


# ─── Model ───────────────────────────────────────────────────────────────────

class AdaptiveParamLSTM(nn.Module):
    """
    Sequence model that watches behavioral patterns over T sessions
    and recommends gentle adaptive parameter changes.

    Input:
        session_seq    : Tensor (batch, T, 14)  — session feature sequences
        current_params : Tensor (batch, 7)      — normalised current params

    Output:
        deltas         : Tensor (batch, 7)      — tanh, then scaled to max delta
    """

    def __init__(
        self,
        input_size=14,
        hidden_size=64,
        num_layers=2,
        param_size=7,
        dropout=0.2,
    ):
        super().__init__()
        self.input_size  = input_size
        self.param_size  = param_size
        self.hidden_size = hidden_size

        # LSTM processes the session sequence
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        # Reduce LSTM output to 32
        self.lstm_proj = nn.Sequential(
            nn.Linear(hidden_size, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
        )

        # FC layers: concat(lstm_out, current_params) → deltas
        self.fc = nn.Sequential(
            nn.Linear(32 + param_size, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, param_size),
            nn.Tanh(),                  # output in [-1, 1]
        )

        # Max delta per param (as a tensor for scaling)
        max_deltas = [MAX_DELTA_PER_SESSION[k] for k in PARAM_KEYS]
        self.register_buffer("max_delta", torch.tensor(max_deltas, dtype=torch.float32))

        # Normalisation ranges for denorm
        lo = [PARAM_SAFE_RANGES[k][0] for k in PARAM_KEYS]
        hi = [PARAM_SAFE_RANGES[k][1] for k in PARAM_KEYS]
        self.register_buffer("param_lo", torch.tensor(lo, dtype=torch.float32))
        self.register_buffer("param_hi", torch.tensor(hi, dtype=torch.float32))

        self._init_weights()

    def _init_weights(self):
        for name, param in self.named_parameters():
            if "weight_ih" in name:
                nn.init.xavier_uniform_(param)
            elif "weight_hh" in name:
                nn.init.orthogonal_(param)
            elif "bias" in name:
                nn.init.zeros_(param)

    def forward(self, session_seq, current_params):
        """
        Args:
            session_seq    : (batch, T, 14)
            current_params : (batch, 7)  — normalised to [0,1]
        Returns:
            deltas         : (batch, 7)  — scaled real-world deltas
        """
        # LSTM over session sequence — take last hidden state
        lstm_out, _ = self.lstm(session_seq)         # (batch, T, hidden)
        last_hidden  = lstm_out[:, -1, :]            # (batch, hidden)

        # Project down
        proj = self.lstm_proj(last_hidden)           # (batch, 32)

        # Concat with current params
        combined = torch.cat([proj, current_params], dim=-1)  # (batch, 39)

        # FC → tanh output in [-1, 1]
        raw_deltas = self.fc(combined)               # (batch, 7)

        # Scale to real-world max delta per parameter
        deltas = raw_deltas * self.max_delta         # (batch, 7)

        return deltas

    def predict_params(self, session_seq, current_params_dict):
        """
        Convenience method: takes dicts, returns new params dict.
        Used during inference (not during training).
        """
        self.eval()
        with torch.no_grad():
            seq = torch.tensor(session_seq, dtype=torch.float32).unsqueeze(0)     # (1, T, 14)
            cur = torch.tensor(
                normalise_params(current_params_dict), dtype=torch.float32
            ).unsqueeze(0)                                                          # (1, 7)

            deltas = self.forward(seq, cur).squeeze(0).cpu().numpy()               # (7,)

        new_params = {}
        for i, k in enumerate(PARAM_KEYS):
            lo, hi = PARAM_SAFE_RANGES[k]
            new_val = current_params_dict[k] + float(deltas[i])
            new_params[k] = float(np.clip(new_val, lo, hi))

        return new_params, {k: float(deltas[i]) for i, k in enumerate(PARAM_KEYS)}


# ─── Apply deltas (used during inference) ─────────────────────────────────────

def apply_deltas(current_params_dict, delta_tensor):
    """
    Apply a delta tensor to a current params dict.
    Clamps all values to safe ranges.

    Args:
        current_params_dict : dict
        delta_tensor        : Tensor (7,) or numpy (7,)
    Returns:
        new params dict
    """
    if hasattr(delta_tensor, "numpy"):
        delta_tensor = delta_tensor.cpu().numpy()

    new_params = {}
    for i, k in enumerate(PARAM_KEYS):
        lo, hi  = PARAM_SAFE_RANGES[k]
        new_val = current_params_dict[k] + float(delta_tensor[i])
        new_params[k] = float(np.clip(new_val, lo, hi))

    return new_params


# ─── Quick model summary ──────────────────────────────────────────────────────

if __name__ == "__main__":
    model = AdaptiveParamLSTM()
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"AdaptiveParamLSTM — {total_params:,} trainable parameters")
    print()

    # Test forward pass
    batch, T, features = 4, 10, 14
    seq     = torch.randn(batch, T, features)
    cur_par = torch.rand(batch, 7)

    deltas = model(seq, cur_par)
    print(f"Input  session_seq  : {seq.shape}")
    print(f"Input  current_params: {cur_par.shape}")
    print(f"Output deltas        : {deltas.shape}")
    print()
    print("Sample delta output (first item in batch):")
    for k, d in zip(PARAM_KEYS, deltas[0].detach().numpy()):
        print(f"  {k:<28}  Δ = {d:+.4f}")