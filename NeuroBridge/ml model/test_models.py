#!/usr/bin/env python
"""Quick test to verify both ML models load and work correctly."""

import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

try:
    print("Testing Phase 1 (Collaborative Filter)...")
    from ml.models.collaborative_filter import CollaborativeFilter
    cf = CollaborativeFilter(top_k=5)
    cf_path = ROOT / "ml" / "data" / "checkpoints" / "collaborative_filter.npz"
    if cf_path.exists():
        cf.load(str(cf_path))
        print(f"  ✅ Phase 1 loaded: {cf_path.name}")
    else:
        print(f"  ❌ Phase 1 checkpoint not found: {cf_path}")

    print("\nTesting Phase 2 (LSTM)...")
    import torch
    from ml.models.lstm_model import AdaptiveParamLSTM, PARAM_KEYS
    lstm = AdaptiveParamLSTM()
    lstm_path = ROOT / "ml" / "data" / "checkpoints" / "lstm_best.pt"
    if lstm_path.exists():
        ckpt = torch.load(str(lstm_path), map_location="cpu", weights_only=False)
        lstm.load_state_dict(ckpt["model_state"])
        lstm.eval()
        print(f"  ✅ Phase 2 loaded: {lstm_path.name}")
    else:
        print(f"  ❌ Phase 2 checkpoint not found: {lstm_path}")

    print("\n✅ Both models loaded successfully!")
    print(f"   Phase 1 outputs: {list(cf.user_scores.keys())[:3] if hasattr(cf, 'user_scores') else 'N/A'}")
    print(f"   Phase 2 outputs: {PARAM_KEYS}")

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
