from pathlib import Path

try:
    from docx import Document
except Exception:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
    from docx import Document

base = Path(r"D:\STUDY\NeuroBridge\ly-project\NeuroBridge")
file_path = base / "NeuroBridge_Research_Formulas.docx"

doc = Document()
doc.add_heading("NeuroBridge Research Formulas Summary", level=1)
doc.add_paragraph("Prepared for research paper use. This document summarizes the main mathematical formulas identified in the project implementation.")

def add_formula(title, formula, source):
    doc.add_heading(title, level=2)
    doc.add_paragraph(formula)
    doc.add_paragraph("Source: " + source)

add_formula("1. Cosine similarity", "similarity(u, v) = (u · v) / (||u|| × ||v||)", "ml model/ml/models/collaborative_filter.py; backend/src/routes/llm.ts")
add_formula("2. Weighted average of similar users", "p̂ = Σ wi pi, where wi = si / (Σ sj + ε)", "ml model/ml/models/collaborative_filter.py")
add_formula("3. Severity score from assessment", "severity_avg = (1/6) × Σ xj, j = 1..6", "ml model/ml/models/collaborative_filter.py")
add_formula("4. Min-max normalization", "x_norm = (x - lo) / (hi - lo + ε)", "ml model/ml/models/lstm_model.py")
add_formula("5. Clipped normalization to [0,1]", "x_norm = min(1, max(0, x_norm))", "ml model/ml/models/lstm_model.py")
add_formula("6. Inverse normalization", "x = x_norm × (hi - lo) + lo", "ml model/ml/models/lstm_model.py")
add_formula("7. LSTM delta prediction", "d = tanh(W · [hT; c] + b) ⊙ Δmax", "ml model/ml/models/lstm_model.py")
add_formula("8. Adaptive parameter update", "p_new = clip(p_current + d, l, h)", "ml model/ml/models/lstm_model.py")
add_formula("9. Mean squared error (MSE)", "L = (1/N) × Σ (yi - ŷi)^2", "ml model/ml/training/train_lstm.py")
add_formula("10. Mean absolute error (MAE)", "MAE = (1/N) × Σ |yi - ŷi|", "ml model/ml/training/train_lstm.py")
add_formula("11. Direction accuracy", "DirectionAccuracy = (1/m) × Σ 1[sign(ŷi) = sign(yi)]", "ml model/ml/training/train_lstm.py")
add_formula("12. Cosine annealing learning rate", "ηt = ηmin + (1/2)(ηmax - ηmin)(1 + cos(πt/T))", "ml model/ml/training/train_lstm.py")
add_formula("13. Accuracy percentage", "Accuracy = (correct / total) × 100", "backend/src/routes/progress.ts")
add_formula("14. Progress rating delta", "Δ = round((Accuracy/100 - 0.6) × 35)", "backend/src/routes/progress.ts")
add_formula("15. Assessment score using accuracy and speed", "score = round(accuracy × 70 + speedScore × 0.3), speedScore = max(0, 100 - 10 × avg_time)", "IMPLEMENTATION_GUIDE.md")
add_formula("16. Weighted assessment score", "score = round(((Tpossible - Wused) / Tpossible) × 100)", "frontend/src/components/assessment/AssessmentTest.tsx")
add_formula("17. Euclidean distance (visual effect)", "d = sqrt((x2 - x1)^2 + (y2 - y1)^2)", "frontend/src/components/ui/ParticleNetwork.tsx")

doc.add_paragraph("Notes: These formulas capture the project’s main mathematical logic in adaptive personalization, ML training, and assessment scoring. Minor implementation details may include epsilon stabilization constants and clipping to ensure valid ranges.")

doc.save(file_path)
print("Created:", file_path)
