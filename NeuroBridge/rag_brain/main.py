from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import uuid
from typing import List, Optional

from processor import DocumentProcessor
from vectorstore import VectorStore
from llm import LLMEngine

app = FastAPI(title="NeuroBridge RAG Brain")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
processor = DocumentProcessor()
store = VectorStore()
llm = LLMEngine()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class QueryRequest(BaseModel):
    query: str
    k: Optional[int] = 5

class QueryResponse(BaseModel):
    answer: str
    reasoning: str
    sources: List[str]
    insights: Optional[str] = None

SYSTEM_PROMPT = """You are a dyslexia learning assistant. 
Answer only using the provided context. 
If the answer is not in the context, say "not enough information".

Rules:
- Keep sentences short and clear.
- Use simple vocabulary.
- Direct and encouraging tone.
- Must cite sources [Source 1], [Source 2] etc."""

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        text = processor.extract_text(file_path)
        chunks = processor.get_chunks(text)
        store.add_texts(chunks, doc_id)
        
        # Precompute summary (Async would be better but keeping it simple)
        summary_prompt = "Summarize this document in 3 small bullet points for a dyslexic student."
        summary = llm.generate(text[:5000], summary_prompt)
        
        return {
            "doc_id": doc_id,
            "filename": file.filename,
            "chunks_count": len(chunks),
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_brain(req: QueryRequest):
    # 1. Retrieve
    chunks = store.search(req.query, k=req.k)
    
    if not chunks:
        return QueryResponse(
            answer="No documents found in the database. Please upload some first.",
            reasoning="Vector store is empty.",
            sources=[]
        )
    
    # 2. Augment & Generate
    prompt = llm.build_rag_prompt(req.query, chunks)
    response_text = llm.generate(prompt, SYSTEM_PROMPT)
    
    # 3. Insight extraction (Simulated structure)
    insights_prompt = "Extract 1 key recommendation from this context for a teacher."
    insight = llm.generate(prompt, insights_prompt)

    return QueryResponse(
        answer=response_text,
        reasoning="Grounded using retrieved chunks from uploaded documents.",
        sources=[c['text'] for c in chunks],
        insights=insight
    )

@app.get("/status")
def get_status():
    return {
        "status": "online",
        "documents_indexed": len(set([c['doc_id'] for c in store.chunks])),
        "total_chunks": len(store.chunks)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
