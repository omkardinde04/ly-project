"""
ml_service.py
--------------
Lightweight Flask microservice that serves NeuroBridge ML predictions.
Runs separately from the Node.js backend on port 5001.

The Node.js backend calls this service — the frontend never talks to it directly.

Endpoints:
  POST /init-params     — Phase 1: given cognitive scores, return starting UI params
  POST /adapt-params    — Phase 2: given session history, return delta params
  GET  /health          — health check

Start:
  pip install flask numpy torch
  python ml_service.py

Place this file next to your ml/ folder (same level as run_all.py).
"""


import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

# rest of your imports below
import flask
import numpy as np
# etc...
import sys
import json
import numpy as np
from pathlib import Path
from flask import Flask, request, jsonify

# ── Path setup — finds your trained checkpoints ──────────────────────────────
ROOT      = Path(__file__).parent
ML_PATH   = ROOT / "ml"
CKPT_PATH = ML_PATH / "data" / "checkpoints"

sys.path.insert(0, str(ROOT))
from ml.models.collaborative_filter import CollaborativeFilter
from ml.models.lstm_model import AdaptiveParamLSTM, PARAM_KEYS

app = Flask(__name__)

# ── Load models once at startup ───────────────────────────────────────────────

print("Loading ML models...")

# Phase 1 — Collaborative Filter
cf_model = CollaborativeFilter(top_k=5)
cf_path  = CKPT_PATH / "collaborative_filter.npz"
if cf_path.exists():
    cf_model.load(str(cf_path))
    print(f"  Phase 1 (CF) loaded ← {cf_path}")
else:
    print(f"  WARNING: CF checkpoint not found at {cf_path}")
    print(f"  Run: python run_all.py  to train the models first.")

# Phase 2 — LSTM
import torch
lstm_model = AdaptiveParamLSTM()
lstm_path  = CKPT_PATH / "lstm_best.pt"
if lstm_path.exists():
    ckpt = torch.load(str(lstm_path), map_location="cpu", weights_only=False)
    lstm_model.load_state_dict(ckpt["model_state"])
    lstm_model.eval()
    print(f"  Phase 2 (LSTM) loaded ← {lstm_path}")
else:
    print(f"  WARNING: LSTM checkpoint not found at {lstm_path}")

print("ML service ready.\n")


# ── Score mapping ─────────────────────────────────────────────────────────────
# Frontend uses 'workingMemory', ML model uses 'memory'
# Frontend scores are 0–100, ML model expects 0.0–1.0

def map_frontend_scores(raw: dict) -> dict:
    """
    Assessment scores are dyslexia severity (high = more dyslexic)
    CF model needs ability scores (high = more able) → so we INVERT
    """
    return {
        "phonological":     (100 - raw.get("phonological",    50)) / 100.0,
        "visual":           (100 - raw.get("visual",           50)) / 100.0,
        "memory":           (100 - raw.get("workingMemory",    50)) / 100.0,
        "processing_speed": (100 - raw.get("processingSpeed",  50)) / 100.0,
        "orthographic":     (100 - raw.get("orthographic",     50)) / 100.0,
        "executive":        (100 - raw.get("executive",        50)) / 100.0,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({
        "status":     "ok",
        "phase1_ready": cf_model.is_fitted,
        "phase2_ready": lstm_path.exists(),
    })


@app.route("/init-params", methods=["POST"])
def init_params():
    """
    Phase 1 — Called once after a user completes the assessment.
    Returns the starting UI params based on similar users.

    Request body:
      { cognitiveProfile: { phonological, visual, workingMemory,
                            processingSpeed, orthographic, executive } }
    Response:
      { params: { font_size, letter_spacing, line_height, mask_opacity,
                  content_difficulty, read_aloud_dependency, font_family_stage } }
    """
    try:
        data    = request.json
        profile = data.get("cognitiveProfile", {})

        if not profile:
            return jsonify({"error": "cognitiveProfile required"}), 400

        scores = map_frontend_scores(profile)
        params = cf_model.predict(scores, verbose=False)

        return jsonify({"params": params})

    except Exception as e:
        print(f"[init-params error] {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/adapt-params", methods=["POST"])
def adapt_params():
    """
    Phase 2 — Called after enough sessions have been logged (8+).
    Takes the last 8 session feature vectors and current params,
    returns updated params with gentle deltas applied.

    Request body:
      {
        sessionHistory:  [[14 floats], ...],  // last 8 sessions
        currentParams:   { font_size, letter_spacing, ... }
      }
    Response:
      {
        newParams: { font_size, letter_spacing, ... },
        deltas:    { font_size: +1.2, ... }
      }
    """
    try:
        data           = request.json
        session_history = data.get("sessionHistory", [])
        current_params  = data.get("currentParams",  {})

        if len(session_history) < 8:
            return jsonify({"error": "Need at least 8 sessions"}), 400

        if not current_params:
            return jsonify({"error": "currentParams required"}), 400

        # Use last 8 sessions
        session_seq = np.array(session_history[-8:], dtype=np.float32)

        new_params, deltas = lstm_model.predict_params(session_seq, current_params)

        return jsonify({
            "newParams": new_params,
            "deltas":    deltas,
        })

    except Exception as e:
        print(f"[adapt-params error] {e}")
        return jsonify({"error": str(e)}), 500


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)