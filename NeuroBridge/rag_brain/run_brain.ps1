# NeuroBridge RAG Brain Startup Script

Write-Host "🚀 Starting NeuroBridge RAG Brain..." -ForegroundColor Cyan

# 1. Check if Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Python 3.11+ is required but not found in PATH." -ForegroundColor Red
    exit
}

# 2. Setup Venv if it doesn't exist
if (!(Test-Path venv)) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# 3. Install requirements
Write-Host "🛠️  Checking dependencies..." -ForegroundColor Yellow
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# 4. Run the service
Write-Host "✅ Service is ready. Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "💡 Note: Ensure Ollama is running if you want local LLM support." -ForegroundColor Gray
.\venv\Scripts\python.exe main.py
