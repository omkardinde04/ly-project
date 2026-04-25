# NeuroBridge RAG Brain

A standalone Python FastAPI service that provides NotebookLM-style source-grounded reasoning using FAISS and local embeddings.

## Features
- **Semantic Parsing**: Extracts text from PDF, DOCX, CSV, and TXT.
- **Vector Storage**: Uses FAISS for high-performance similarity search.
- **Local Embeddings**: `all-MiniLM-L6-v2` runs locally via SentenceTransformers.
- **Hybrid LLM**: Supports local Ollama (Llama 3) with a fallback to Google Gemini.
- **Source Grounding**: Answers include references to specific document chunks.

## Prerequisites
- Python 3.11+
- [Ollama](https://ollama.com/) (Optional, for 100% offline local reasoning)

## Setup & Run

1. Open a PowerShell window in this directory.
2. Run the startup script:
   ```powershell
   .\run_brain.ps1
   ```

## API Endpoints
- `POST /upload`: Upload and index a document.
- `POST /query`: Semantic search and LLM generation.
- `GET /status`: Monitor document and chunk count.

## Manual Enrichment (NotebookLM Flow)
If you want to improve reasoning:
1. Upload your documents to Google NotebookLM manually.
2. Generate structured notes/summaries there.
3. Save those notes as `.txt` files in this platform to add them to the local "Brain".
