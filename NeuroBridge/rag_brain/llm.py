import requests
import json
import os

class LLMEngine:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def generate(self, prompt: str, system_prompt: str = "") -> str:
        # Try Ollama first
        try:
            full_prompt = f"{system_prompt}\n\nContext:\n{prompt}"
            response = requests.post(self.ollama_url, json={
                "model": "llama3", # or "mistral", "dyslexia-care"
                "prompt": full_prompt,
                "stream": False
            }, timeout=30)
            
            if response.status_ok:
                return response.json().get("response", "")
        except Exception:
            print("[LLM] Ollama not available, falling back to Gemini...")

        # Fallback to Gemini
        if not self.api_key:
            return "Error: No API key for Gemini fallback."

        try:
            headers = {'Content-Type': 'application/json'}
            body = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n{prompt}"}]}]
            }
            res = requests.post(f"{self.gemini_url}?key={self.api_key}", headers=headers, json=body)
            data = res.json()
            return data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            return f"Error connecting to LLM: {str(e)}"

    def build_rag_prompt(self, query: str, context_chunks: list) -> str:
        context_text = "\n\n".join([f"Source [{i+1}]: {c['text']}" for i, c in enumerate(context_chunks)])
        return f"User Question: {query}\n\n{context_text}"
