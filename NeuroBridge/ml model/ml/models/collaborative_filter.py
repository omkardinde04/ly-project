"""
collaborative_filter.py
------------------------
Phase 1 of the NeuroBridge adaptive ML system.

What it does:
  - Takes a new user's 6 cognitive scores from the assessment
  - Finds the most similar existing users (cosine similarity)
  - Returns their averaged adaptive_params as the new user's starting point
  - Falls back to rule-based defaults if the user base is too small

This runs ONCE — right after a user completes their assessment.

Usage:
    from ml.models.collaborative_filter import CollaborativeFilter

    cf = CollaborativeFilter()
    cf.fit(users)                          # pass the list from users.json
    params = cf.predict(new_user_scores)   # returns initial param dict
"""

import json
import numpy as np
from pathlib import Path


# ─── Safe ranges for clamping output ─────────────────────────────────────────

PARAM_SAFE_RANGES = {
    "font_size":             (16.0, 72.0),   # up to 72px — very readable
    "letter_spacing":        (0.0,  0.60),   # noticeable difference
    "line_height":           (1.2,  3.2),    # big breathing room
    "mask_opacity":          (0.0,  1.0),
    "content_difficulty":    (1.0,  10.0),
    "read_aloud_dependency": (0.0,  1.0),
    "font_family_stage":     (0.0,  2.0),
}

PARAM_KEYS = list(PARAM_SAFE_RANGES.keys())

RULE_BASED_DEFAULTS = {
    "severe":   {"font_size": 64, "letter_spacing": 0.55, "line_height": 3.0,
                 "mask_opacity": 0.95, "content_difficulty": 1,
                 "read_aloud_dependency": 0.95, "font_family_stage": 0},

    "moderate": {"font_size": 48, "letter_spacing": 0.38, "line_height": 2.4,
                 "mask_opacity": 0.65, "content_difficulty": 3,
                 "read_aloud_dependency": 0.65, "font_family_stage": 0},

    "mild":     {"font_size": 34, "letter_spacing": 0.20, "line_height": 1.85,
                 "mask_opacity": 0.35, "content_difficulty": 6,
                 "read_aloud_dependency": 0.30, "font_family_stage": 1},

    "minimal":  {"font_size": 18, "letter_spacing": 0.05, "line_height": 1.25,
                 "mask_opacity": 0.05, "content_difficulty": 9,
                 "read_aloud_dependency": 0.05, "font_family_stage": 2},
}

def severity_from_scores(scores_dict):
    avg = np.mean(list(scores_dict.values()))
    if avg < 0.25:   return "severe"
    elif avg < 0.45: return "moderate"
    elif avg < 0.65: return "mild"
    else:            return "minimal"

def clamp_params(params):
    out = {}
    for k, v in params.items():
        lo, hi = PARAM_SAFE_RANGES[k]
        out[k] = float(np.clip(v, lo, hi))
    return out


# ─── Collaborative Filter ─────────────────────────────────────────────────────

class CollaborativeFilter:
    """
    Finds similar users by cosine similarity on 6 cognitive scores,
    then averages their working adaptive params as a starting point.
    """

    def __init__(self, top_k=5, min_users_for_cf=5):
        self.top_k             = top_k
        self.min_users_for_cf  = min_users_for_cf
        self.user_score_matrix = None   # shape (N, 6)
        self.user_param_matrix = None   # shape (N, 7) — initial params
        self.user_ids          = []
        self.is_fitted         = False

    def _scores_to_vec(self, scores_dict):
        """Convert cognitive scores dict → numpy vector (6,)"""
        keys = ["phonological", "visual", "memory",
                "processing_speed", "orthographic", "executive"]
        return np.array([scores_dict[k] for k in keys], dtype=np.float32)

    def _params_to_vec(self, params_dict):
        """Convert params dict → numpy vector (7,)"""
        return np.array([params_dict[k] for k in PARAM_KEYS], dtype=np.float32)

    def _vec_to_params(self, vec):
        """Convert numpy vector (7,) → params dict"""
        return {k: float(v) for k, v in zip(PARAM_KEYS, vec)}

    def fit(self, users):
        """
        Train on a list of user dicts (from users.json).
        Each user must have 'cognitive_scores' and 'initial_params'.
        """
        score_rows = []
        param_rows = []
        ids        = []

        for u in users:
            score_rows.append(self._scores_to_vec(u["cognitive_scores"]))
            param_rows.append(self._params_to_vec(u["initial_params"]))
            ids.append(u["user_id"])

        self.user_score_matrix = np.stack(score_rows)   # (N, 6)
        self.user_param_matrix = np.stack(param_rows)   # (N, 7)
        self.user_ids          = ids
        self.is_fitted         = True
        print(f"CollaborativeFilter fitted on {len(ids)} users.")

    def predict(self, new_user_scores, verbose=False):
        """
        Given a new user's cognitive scores dict, return recommended
        starting adaptive_params dict.

        Args:
            new_user_scores: dict with keys phonological, visual, memory,
                             processing_speed, orthographic, executive
            verbose:         print similarity info

        Returns:
            dict of adaptive params, clamped to safe ranges
        """
        if not self.is_fitted or len(self.user_ids) < self.min_users_for_cf:
            # Not enough users → fall back to rule-based
            severity = severity_from_scores(new_user_scores)
            params   = dict(RULE_BASED_DEFAULTS[severity])
            if verbose:
                print(f"Fallback → rule-based defaults (severity: {severity})")
            return clamp_params(params)

        # Cosine similarity
        query = self._scores_to_vec(new_user_scores)
        query_norm = query / (np.linalg.norm(query) + 1e-8)
        db_norms   = self.user_score_matrix / (
            np.linalg.norm(self.user_score_matrix, axis=1, keepdims=True) + 1e-8
        )
        similarities = db_norms @ query_norm  # (N,)

        # Top-K indices
        top_k_idx = np.argsort(similarities)[::-1][:self.top_k]
        top_k_sim = similarities[top_k_idx]

        if verbose:
            print(f"Top-{self.top_k} similar users:")
            for idx, sim in zip(top_k_idx, top_k_sim):
                print(f"  {self.user_ids[idx]}  similarity={sim:.3f}")

        # Weighted average of their params
        weights     = top_k_sim / (top_k_sim.sum() + 1e-8)
        top_k_params = self.user_param_matrix[top_k_idx]   # (K, 7)
        avg_params   = (top_k_params * weights[:, None]).sum(axis=0)

        params = self._vec_to_params(avg_params)
        return clamp_params(params)

    def save(self, path):
        """Save fitted data to a .npz file."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        np.savez(
            path,
            score_matrix=self.user_score_matrix,
            param_matrix=self.user_param_matrix,
            user_ids=np.array(self.user_ids),
        )
        print(f"CollaborativeFilter saved → {path}")

    def load(self, path):
        """Load fitted data from a .npz file."""
        data = np.load(path, allow_pickle=True)
        self.user_score_matrix = data["score_matrix"]
        self.user_param_matrix = data["param_matrix"]
        self.user_ids          = list(data["user_ids"])
        self.is_fitted         = True
        print(f"CollaborativeFilter loaded ← {path}  ({len(self.user_ids)} users)")


# ─── Run standalone ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    data_path = Path(__file__).parent.parent / "data"

    # Load synthetic users
    with open(data_path / "users.json") as f:
        users = json.load(f)

    # Fit
    cf = CollaborativeFilter(top_k=5)
    cf.fit(users)

    # Save
    cf.save(data_path / "checkpoints" / "collaborative_filter.npz")

    print()
    print("─── Test Predictions ───────────────────────────────────────")

    test_cases = [
        {
            "label": "Severe phonological dyslexia",
            "scores": {"phonological": 0.18, "visual": 0.62, "memory": 0.50,
                       "processing_speed": 0.48, "orthographic": 0.30, "executive": 0.55}
        },
        {
            "label": "Visual crowding dominant",
            "scores": {"phonological": 0.65, "visual": 0.18, "memory": 0.55,
                       "processing_speed": 0.52, "orthographic": 0.48, "executive": 0.60}
        },
        {
            "label": "Mild, mixed",
            "scores": {"phonological": 0.72, "visual": 0.70, "memory": 0.68,
                       "processing_speed": 0.71, "orthographic": 0.69, "executive": 0.74}
        },
    ]

    for case in test_cases:
        print(f"\nUser: {case['label']}")
        params = cf.predict(case["scores"], verbose=True)
        for k, v in params.items():
            print(f"  {k:<28} {v:.3f}")