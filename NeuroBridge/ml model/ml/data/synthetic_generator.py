"""
synthetic_generator.py
-----------------------
Generates realistic fake users and session data for training the NeuroBridge ML model.

Each user has:
  - 6 cognitive scores from the assessment (the seed)
  - N sessions of behavioral events (the daily patterns)
  - A ground-truth adaptive_params trajectory (what the model should learn to predict)

Run:
    python ml/data/synthetic_generator.py
Outputs:
    ml/data/users.json
    ml/data/sessions.json
"""

import json
import random
import numpy as np
from pathlib import Path

random.seed(42)
np.random.seed(42)

# ─── Dyslexia profiles ────────────────────────────────────────────────────────
# Each profile is a tuple of (mean, std) for each of the 6 cognitive scores.
# Scores range 0.0 (severe difficulty) to 1.0 (no difficulty).
# Order: phonological, visual, memory, processing_speed, orthographic, executive

PROFILES = {
    "phonological_dominant": {
        # Struggles mainly with sound-letter mapping
        "means": [0.25, 0.65, 0.55, 0.50, 0.35, 0.60],
        "stds":  [0.08, 0.10, 0.10, 0.10, 0.08, 0.10],
    },
    "visual_dominant": {
        # Struggles with crowding, letter reversals
        "means": [0.60, 0.20, 0.55, 0.50, 0.50, 0.60],
        "stds":  [0.10, 0.08, 0.10, 0.10, 0.10, 0.10],
    },
    "mixed_moderate": {
        # Moderate difficulty across all dimensions
        "means": [0.45, 0.42, 0.48, 0.44, 0.46, 0.50],
        "stds":  [0.08, 0.08, 0.08, 0.08, 0.08, 0.08],
    },
    "mild": {
        # Mild dyslexia — relatively high scores
        "means": [0.70, 0.68, 0.72, 0.70, 0.68, 0.75],
        "stds":  [0.08, 0.08, 0.08, 0.08, 0.08, 0.08],
    },
    "severe": {
        # Severe across the board
        "means": [0.15, 0.18, 0.20, 0.18, 0.15, 0.22],
        "stds":  [0.06, 0.06, 0.06, 0.06, 0.06, 0.06],
    },
}

# ─── Starting params by dyslexia severity ────────────────────────────────────
# font_size, letter_spacing, line_height, mask_opacity, content_difficulty,
# read_aloud_dependency, font_family_stage (0=OpenDyslexic, 1=Lexie, 2=system)

def severity_from_scores(scores):
    avg = np.mean(scores)
    if avg < 0.25:
        return "severe"
    elif avg < 0.45:
        return "moderate"
    elif avg < 0.65:
        return "mild"
    else:
        return "minimal"

STARTING_PARAMS = {
    "severe":   {"font_size": 46, "letter_spacing": 0.18, "line_height": 2.1,
                 "mask_opacity": 0.95, "content_difficulty": 1,
                 "read_aloud_dependency": 0.90, "font_family_stage": 0},
    "moderate": {"font_size": 40, "letter_spacing": 0.14, "line_height": 1.9,
                 "mask_opacity": 0.70, "content_difficulty": 3,
                 "read_aloud_dependency": 0.65, "font_family_stage": 0},
    "mild":     {"font_size": 34, "letter_spacing": 0.10, "line_height": 1.7,
                 "mask_opacity": 0.40, "content_difficulty": 5,
                 "read_aloud_dependency": 0.35, "font_family_stage": 1},
    "minimal":  {"font_size": 26, "letter_spacing": 0.06, "line_height": 1.5,
                 "mask_opacity": 0.10, "content_difficulty": 7,
                 "read_aloud_dependency": 0.10, "font_family_stage": 2},
}

PARAM_SAFE_RANGES = {
    "font_size":             (16, 48),
    "letter_spacing":        (0.0, 0.20),
    "line_height":           (1.4, 2.2),
    "mask_opacity":          (0.0, 1.0),
    "content_difficulty":    (1, 10),
    "read_aloud_dependency": (0.0, 1.0),
    "font_family_stage":     (0, 2),
}

def clamp_params(params):
    clamped = {}
    for k, v in params.items():
        lo, hi = PARAM_SAFE_RANGES[k]
        clamped[k] = float(np.clip(v, lo, hi))
    return clamped

# ─── Session feature vector ───────────────────────────────────────────────────
# 14 dimensions:
# [0]  tts_rate               — TTS triggers / total words seen this session
# [1]  scroll_back_rate       — scroll backs / paragraphs
# [2]  avg_word_hover_ms      — average hover time on words (normalised 0–1)
# [3]  task_accuracy_phonological
# [4]  task_accuracy_visual
# [5]  task_accuracy_memory
# [6]  task_accuracy_processing
# [7]  task_accuracy_orthographic
# [8]  task_accuracy_executive
# [9]  speed_vs_accuracy      — how fast they complete tasks (0=very slow, 1=fast)
# [10] abandonment_rate       — tasks abandoned / tasks started
# [11] manual_setting_changes — did they manually change any accessibility setting
# [12] focal_reading_usage    — did they use focal reading toggle
# [13] session_length_norm    — session length normalised (0–1, max 60 min)

FEATURE_NAMES = [
    "tts_rate", "scroll_back_rate", "avg_word_hover_ms_norm",
    "acc_phonological", "acc_visual", "acc_memory",
    "acc_processing", "acc_orthographic", "acc_executive",
    "speed_vs_accuracy", "abandonment_rate",
    "manual_setting_changes", "focal_reading_usage", "session_length_norm"
]

def simulate_session(cognitive_scores, current_params, session_num, improving=True):
    """
    Simulate one session's behavioral data.
    If improving=True, accuracy slowly rises and TTS dependency drops.
    """
    progress = min(session_num / 30.0, 1.0)  # 0 → 1 over 30 sessions
    noise = lambda s: np.random.normal(0, s)

    # Base accuracy follows cognitive scores, improves with sessions
    accs = []
    for score in cognitive_scores:
        base = score + (progress * 0.15 * improving) + noise(0.05)
        accs.append(float(np.clip(base, 0.0, 1.0)))

    avg_acc = np.mean(accs)

    # TTS usage drops as user improves
    tts = float(np.clip(
        current_params["read_aloud_dependency"] - (progress * 0.2 * improving) + noise(0.05),
        0.0, 1.0
    ))

    scroll_back = float(np.clip(
        (1.0 - avg_acc) * 0.4 + noise(0.04),
        0.0, 1.0
    ))

    hover_norm = float(np.clip(
        (1.0 - avg_acc) * 0.5 + noise(0.05),
        0.0, 1.0
    ))

    speed = float(np.clip(avg_acc * 0.8 + progress * 0.15 + noise(0.05), 0.0, 1.0))
    abandon = float(np.clip((1.0 - avg_acc) * 0.3 + noise(0.04), 0.0, 1.0))
    manual_change = float(np.random.random() < 0.05)  # 5% chance per session
    focal = float(current_params["mask_opacity"] > 0.3 and np.random.random() < 0.4)
    length_norm = float(np.clip(np.random.uniform(0.3, 1.0), 0.0, 1.0))

    return [
        tts, scroll_back, hover_norm,
        accs[0], accs[1], accs[2], accs[3], accs[4], accs[5],
        speed, abandon, manual_change, focal, length_norm
    ]

def compute_next_params(current_params, session_vec, cognitive_scores):
    """
    Ground truth: what parameter changes should happen after this session?
    This is what the LSTM will learn to predict.
    Returns delta dict.
    """
    tts_rate  = session_vec[0]
    avg_acc   = np.mean(session_vec[3:9])
    abandon   = session_vec[10]
    manual    = session_vec[11]
    speed     = session_vec[9]

    deltas = {k: 0.0 for k in current_params}

    # If accuracy is strong — reduce scaffolding
    if avg_acc > 0.82 and abandon < 0.15:
        deltas["font_size"]          -= random.uniform(0.5, 1.5)
        deltas["letter_spacing"]     -= random.uniform(0.003, 0.008)
        deltas["line_height"]        -= random.uniform(0.02, 0.06)
        deltas["mask_opacity"]       -= random.uniform(0.02, 0.06)
        deltas["content_difficulty"] += random.uniform(0.1, 0.4)

    # If TTS dependency is falling — reduce its prominence
    if tts_rate < current_params["read_aloud_dependency"] - 0.1:
        deltas["read_aloud_dependency"] -= random.uniform(0.02, 0.06)

    # If struggling — hold or roll back slightly
    if avg_acc < 0.55 or abandon > 0.35:
        deltas["font_size"]      += random.uniform(0.3, 1.0)
        deltas["letter_spacing"] += random.uniform(0.002, 0.005)
        deltas["mask_opacity"]   += random.uniform(0.01, 0.04)

    # Manual override → user knows best, respect it
    if manual > 0.5:
        deltas = {k: 0.0 for k in deltas}

    return deltas

# ─── Main generation ──────────────────────────────────────────────────────────

def generate_user(user_id, profile_name=None):
    if profile_name is None:
        profile_name = random.choice(list(PROFILES.keys()))

    profile = PROFILES[profile_name]
    scores = []
    for mean, std in zip(profile["means"], profile["stds"]):
        s = float(np.clip(np.random.normal(mean, std), 0.0, 1.0))
        scores.append(s)

    severity = severity_from_scores(scores)
    params   = dict(STARTING_PARAMS[severity])

    user = {
        "user_id":      user_id,
        "profile":      profile_name,
        "severity":     severity,
        "cognitive_scores": {
            "phonological":      scores[0],
            "visual":            scores[1],
            "memory":            scores[2],
            "processing_speed":  scores[3],
            "orthographic":      scores[4],
            "executive":         scores[5],
        },
        "initial_params": dict(params),
    }
    return user, scores, params

def generate_dataset(n_users=300, sessions_per_user=25):
    users    = []
    sessions = []

    profile_names = list(PROFILES.keys())
    for i in range(n_users):
        uid          = f"user_{i:04d}"
        profile_name = profile_names[i % len(profile_names)]
        user, scores, params = generate_user(uid, profile_name)
        users.append(user)

        # Simulate sessions — 80% improving, 20% plateau/regressing
        improving = random.random() < 0.80
        current_params = dict(params)

        for s in range(sessions_per_user):
            session_vec = simulate_session(scores, current_params, s, improving)
            deltas      = compute_next_params(current_params, session_vec, scores)

            sessions.append({
                "user_id":      uid,
                "session_num":  s,
                "features":     session_vec,
                "feature_names": FEATURE_NAMES,
                "params_before": dict(current_params),
                "deltas":       deltas,
            })

            # Apply deltas for next session
            for k, d in deltas.items():
                current_params[k] = current_params[k] + d
            current_params = clamp_params(current_params)

    return users, sessions

# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    out = Path(__file__).parent
    print("Generating synthetic NeuroBridge dataset...")

    users, sessions = generate_dataset(n_users=300, sessions_per_user=25)

    with open(out / "users.json", "w") as f:
        json.dump(users, f, indent=2)
    with open(out / "sessions.json", "w") as f:
        json.dump(sessions, f, indent=2)

    print(f"  Users generated    : {len(users)}")
    print(f"  Sessions generated : {len(sessions)}")
    print(f"  Saved to           : {out}/users.json + sessions.json")
    print()

    # Quick sanity check
    profiles_dist = {}
    for u in users:
        p = u["profile"]
        profiles_dist[p] = profiles_dist.get(p, 0) + 1
    print("Profile distribution:")
    for p, count in profiles_dist.items():
        print(f"  {p:<30} {count} users")