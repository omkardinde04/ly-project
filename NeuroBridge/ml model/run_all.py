"""
run_all.py
-----------
Runs the entire NeuroBridge ML pipeline in order:

  Step 1 — Generate synthetic data
  Step 2 — Train Phase 1: Collaborative Filter
  Step 3 — Train Phase 2: LSTM

Run this from the neurobridge_ml/ root:
    python run_all.py

Requirements:
    pip install torch numpy scikit-learn matplotlib
"""
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent

def run(script, label):
    print()
    print("=" * 60)
    print(f"  {label}")
    print("=" * 60)
    result = subprocess.run(
        [sys.executable, str(script)],
        cwd=str(ROOT),
    )
    if result.returncode != 0:
        print(f"\n  ERROR in {label}. Stopping.")
        sys.exit(1)

if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║         NeuroBridge — Full ML Training Pipeline          ║")
    print("╚══════════════════════════════════════════════════════════╝")

    run(ROOT / "ml" / "data"     / "synthetic_generator.py",   "Step 1 — Generating synthetic data")
    run(ROOT / "ml" / "models"   / "collaborative_filter.py",  "Step 2 — Training Collaborative Filter (Phase 1)")
    run(ROOT / "ml" / "training" / "train_lstm.py",            "Step 3 — Training LSTM (Phase 2)")

    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║                    All done!                             ║")
    print("║                                                          ║")
    print("║  Checkpoints saved in:                                   ║")
    print("║    ml/data/checkpoints/collaborative_filter.npz          ║")
    print("║    ml/data/checkpoints/lstm_best.pt                      ║")
    print("║    ml/data/checkpoints/loss_history.json                 ║")
    print("║    ml/data/checkpoints/loss_curve.png  (if matplotlib)   ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()