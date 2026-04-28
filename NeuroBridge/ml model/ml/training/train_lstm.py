"""
train_lstm.py
--------------
Training script for Phase 2 — AdaptiveParamLSTM.

3-way user-level split: 75% train | 15% val | 10% test
  - Val   : early stopping + checkpoint selection
  - Test  : locked until the very end — honest final accuracy

Per-epoch direction accuracy is tracked on val and plotted alongside loss.

Run:
    python ml/training/train_lstm.py
"""

import json
import random
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

ROOT      = Path(__file__).parent.parent
DATA_PATH = ROOT / "data"
CKPT_PATH = DATA_PATH / "checkpoints"
CKPT_PATH.mkdir(parents=True, exist_ok=True)

import sys
sys.path.insert(0, str(ROOT.parent))
from ml.models.lstm_model import AdaptiveParamLSTM, normalise_params, PARAM_KEYS

# ─── Hyperparameters ──────────────────────────────────────────────────────────

T            = 8
BATCH_SIZE   = 64
EPOCHS       = 60
LR           = 3e-4
WEIGHT_DECAY = 1e-4
PATIENCE     = 10
TRAIN_RATIO  = 0.75
VAL_RATIO    = 0.15
TEST_RATIO   = 0.10
SEED         = 42

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)


# ─── User-level split ─────────────────────────────────────────────────────────

def split_users_by_id(sessions, train_ratio, val_ratio, seed):
    user_ids = list({s["user_id"] for s in sessions})
    rng = random.Random(seed)
    rng.shuffle(user_ids)

    n         = len(user_ids)
    n_train   = int(n * train_ratio)
    n_val     = int(n * val_ratio)
    train_ids = set(user_ids[:n_train])
    val_ids   = set(user_ids[n_train : n_train + n_val])
    test_ids  = set(user_ids[n_train + n_val :])

    return (
        [s for s in sessions if s["user_id"] in train_ids],
        [s for s in sessions if s["user_id"] in val_ids],
        [s for s in sessions if s["user_id"] in test_ids],
        train_ids, val_ids, test_ids,
    )


# ─── Dataset ──────────────────────────────────────────────────────────────────

class SessionDataset(Dataset):
    def __init__(self, sessions, window=T):
        self.samples = []
        by_user = {}
        for s in sessions:
            by_user.setdefault(s["user_id"], []).append(s)

        for uid, sess in by_user.items():
            sess.sort(key=lambda x: x["session_num"])
            for i in range(window, len(sess)):
                seq = np.array(
                    [sess[j]["features"] for j in range(i - window, i)],
                    dtype=np.float32
                )
                cur_params = normalise_params(sess[i]["params_before"])
                target = np.array(
                    [sess[i]["deltas"][k] for k in PARAM_KEYS],
                    dtype=np.float32
                )
                self.samples.append((seq, cur_params, target))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        seq, cur, tgt = self.samples[idx]
        return (
            torch.tensor(seq, dtype=torch.float32),
            torch.tensor(cur, dtype=torch.float32),
            torch.tensor(tgt, dtype=torch.float32),
        )


# ─── Evaluation helper ────────────────────────────────────────────────────────

def evaluate_loader(model, loader, device, label=""):
    criterion = nn.MSELoss()
    model.eval()
    total_loss, all_preds, all_targets = 0.0, [], []

    with torch.no_grad():
        for seq, cur, tgt in loader:
            seq, cur, tgt = seq.to(device), cur.to(device), tgt.to(device)
            preds = model(seq, cur)
            total_loss += criterion(preds, tgt).item() * len(seq)
            all_preds.append(preds.cpu().numpy())
            all_targets.append(tgt.cpu().numpy())

    n           = sum(len(b[0]) for b in loader)
    avg_loss    = total_loss / n
    all_preds   = np.concatenate(all_preds,   axis=0)
    all_targets = np.concatenate(all_targets, axis=0)

    if label:
        print(f"\n─── {label} " + "─" * max(0, 55 - len(label)))
        print(f"  {'Parameter':<28}  {'MAE':>8}  {'Direction Acc':>14}")
        print("  " + "─" * 54)
        for i, k in enumerate(PARAM_KEYS):
            mae      = float(np.mean(np.abs(all_preds[:, i] - all_targets[:, i])))
            non_zero = np.abs(all_targets[:, i]) > 1e-4
            dir_acc  = float(
                (np.sign(all_preds[:, i][non_zero]) == np.sign(all_targets[:, i][non_zero])).mean()
            ) if non_zero.sum() > 0 else float("nan")
            dir_str  = f"{dir_acc:.1%}" if not np.isnan(dir_acc) else "  n/a"
            print(f"  {k:<28}  {mae:>8.5f}  {dir_str:>14}")

    return avg_loss, all_preds, all_targets


# ─── Training ─────────────────────────────────────────────────────────────────

def train():
    print("=" * 65)
    print("  NeuroBridge — Phase 2 LSTM Training (User-Level 3-Way Split)")
    print("=" * 65)

    print("\nLoading session data...")
    with open(DATA_PATH / "sessions.json") as f:
        sessions = json.load(f)
    print(f"  {len(sessions)} total sessions loaded")

    train_sess, val_sess, test_sess, train_ids, val_ids, test_ids = \
        split_users_by_id(sessions, TRAIN_RATIO, VAL_RATIO, SEED)

    print(f"\n  Split by USER (no user appears in more than one split):")
    print(f"  Train : {len(train_ids):>4} users  →  {len(train_sess):>5} sessions")
    print(f"  Val   : {len(val_ids):>4} users  →  {len(val_sess):>5} sessions")
    print(f"  Test  : {len(test_ids):>4} users  →  {len(test_sess):>5} sessions  ← LOCKED")

    train_ds = SessionDataset(train_sess)
    val_ds   = SessionDataset(val_sess)
    test_ds  = SessionDataset(test_sess)

    print(f"\n  Windowed samples (window={T}):")
    print(f"  Train : {len(train_ds)}")
    print(f"  Val   : {len(val_ds)}")
    print(f"  Test  : {len(test_ds)}  ← not touched until training done")

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nDevice: {device}")
    model  = AdaptiveParamLSTM().to(device)
    print(f"Model params: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")

    optimiser = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimiser, T_max=EPOCHS)
    criterion = nn.MSELoss()

    print(f"\nTraining for up to {EPOCHS} epochs  |  early stop patience={PATIENCE}\n")

    best_val_loss    = float("inf")
    epochs_no_improv = 0
    train_losses, val_losses, val_dir_accs = [], [], []

    for epoch in range(1, EPOCHS + 1):
        t0 = time.time()

        # ── Train
        model.train()
        train_loss = 0.0
        for seq, cur, tgt in train_loader:
            seq, cur, tgt = seq.to(device), cur.to(device), tgt.to(device)
            optimiser.zero_grad()
            loss = criterion(model(seq, cur), tgt)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimiser.step()
            train_loss += loss.item() * len(seq)
        train_loss /= len(train_ds)
        train_losses.append(train_loss)

        # ── Validate + compute direction accuracy
        model.eval()
        val_loss, ep_preds, ep_targets = 0.0, [], []
        with torch.no_grad():
            for seq, cur, tgt in val_loader:
                seq, cur, tgt = seq.to(device), cur.to(device), tgt.to(device)
                preds     = model(seq, cur)
                val_loss += criterion(preds, tgt).item() * len(seq)
                ep_preds.append(preds.cpu().numpy())
                ep_targets.append(tgt.cpu().numpy())
        val_loss   /= len(val_ds)
        val_losses.append(val_loss)

        ep_preds   = np.concatenate(ep_preds,   axis=0)
        ep_targets = np.concatenate(ep_targets, axis=0)
        non_zero   = np.abs(ep_targets) > 1e-4
        dir_acc    = float(
            (np.sign(ep_preds[non_zero]) == np.sign(ep_targets[non_zero])).mean() * 100.0
        ) if non_zero.sum() > 0 else float("nan")
        val_dir_accs.append(dir_acc)

        scheduler.step()

        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:3d}/{EPOCHS}  |  "
                  f"train={train_loss:.6f}  val={val_loss:.6f}  "
                  f"dir_acc={dir_acc:.1f}%  "
                  f"lr={scheduler.get_last_lr()[0]:.2e}  ({time.time()-t0:.1f}s)")

        if val_loss < best_val_loss:
            best_val_loss    = val_loss
            epochs_no_improv = 0
            torch.save({
                "epoch": epoch, "model_state": model.state_dict(),
                "optim_state": optimiser.state_dict(),
                "val_loss": val_loss, "train_loss": train_loss,
                "split_info": {
                    "train_users": len(train_ids), "val_users": len(val_ids),
                    "test_users": len(test_ids), "split_by": "user_id",
                },
                "config": {"window": T, "param_keys": PARAM_KEYS},
            }, CKPT_PATH / "lstm_best.pt")
        else:
            epochs_no_improv += 1
            if epochs_no_improv >= PATIENCE:
                print(f"\n  Early stopping at epoch {epoch} "
                      f"(no val improvement for {PATIENCE} epochs)")
                break

    print(f"\n  Best val loss : {best_val_loss:.6f}")
    print(f"  Checkpoint   → {CKPT_PATH / 'lstm_best.pt'}")

    # ── Reload best and evaluate
    ckpt = torch.load(CKPT_PATH / "lstm_best.pt", map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model_state"])

    evaluate_loader(model, val_loader, device, "Validation Set (used for early stopping)")

    print("\n" + "█" * 65)
    print("  FINAL TEST SET  —  users never seen during training")
    print("█" * 65)
    test_loss, _, _ = evaluate_loader(model, test_loader, device, "Test Set — HONEST FINAL ACCURACY")
    print(f"\n  Final test MSE : {test_loss:.6f}")
    print("█" * 65)

    # ── Save history
    with open(CKPT_PATH / "loss_history.json", "w") as f:
        json.dump({"train": train_losses, "val": val_losses, "dir_acc": val_dir_accs}, f)
    print(f"\n  History saved → {CKPT_PATH / 'loss_history.json'}")

    # ── Plot: loss curve + accuracy curve side by side
    try:
        import matplotlib.pyplot as plt
        import matplotlib.gridspec as gridspec

        fig = plt.figure(figsize=(16, 5))
        gs  = gridspec.GridSpec(1, 3, figure=fig, wspace=0.35)

        epochs_range = range(1, len(train_losses) + 1)

        # 1. Loss curve
        ax1 = fig.add_subplot(gs[0])
        ax1.plot(epochs_range, train_losses, label="Train loss", linewidth=1.8, color="#4C8BF5")
        ax1.plot(epochs_range, val_losses,   label="Val loss",   linewidth=1.8, color="#F5A623")
        ax1.axhline(test_loss, color="#E74C3C", linestyle="--",
                    linewidth=1.2, label=f"Test loss ({test_loss:.5f})")
        ax1.set_xlabel("Epoch"); ax1.set_ylabel("MSE Loss")
        ax1.set_title("Loss Curve"); ax1.legend(fontsize=8)

        # 2. Direction accuracy curve
        ax2 = fig.add_subplot(gs[1])
        clean_accs = [a for a in val_dir_accs if not np.isnan(a)]
        clean_eps  = [i+1 for i, a in enumerate(val_dir_accs) if not np.isnan(a)]
        ax2.plot(clean_eps, clean_accs, linewidth=1.8, color="#2ECC71", label="Val dir acc")
        ax2.axhline(100, color="#888", linestyle=":", linewidth=1)
        ax2.set_ylim(max(0, min(clean_accs) - 5), 102)
        ax2.set_xlabel("Epoch"); ax2.set_ylabel("Direction Accuracy (%)")
        ax2.set_title("Direction Accuracy\n(did model predict ↑↓ correctly?)")
        ax2.legend(fontsize=8)

        # 3. User-split pie
        ax3 = fig.add_subplot(gs[2])
        ax3.pie(
            [len(train_ids), len(val_ids), len(test_ids)],
            labels=[f"Train\n{len(train_ids)} users",
                    f"Val\n{len(val_ids)} users",
                    f"Test\n{len(test_ids)} users"],
            colors=["#4C8BF5", "#F5A623", "#E74C3C"],
            autopct="%1.0f%%", startangle=90,
        )
        ax3.set_title("User-Level Split\n(no leakage between splits)")

        plt.suptitle("NeuroBridge LSTM — Training Results", fontsize=13, fontweight="bold")
        plt.savefig(CKPT_PATH / "loss_curve.png", dpi=150, bbox_inches="tight")
        print(f"  Plot saved    → {CKPT_PATH / 'loss_curve.png'}")
        plt.close()
    except ImportError:
        print("  (matplotlib not installed — skipping plot)")

    print("\nTraining complete!")


if __name__ == "__main__":
    train()