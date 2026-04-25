import os
from typing import List, Dict
import pandas as pd
from PyPDF2 import PdfReader
from docx import Document
import re

class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def extract_text(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return self._parse_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            return self._parse_docx(file_path)
        elif ext == '.csv':
            return self._parse_csv(file_path)
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def _parse_pdf(self, file_path: str) -> str:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        return text

    def _parse_docx(self, file_path: str) -> str:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    def _parse_csv(self, file_path: str) -> str:
        df = pd.read_csv(file_path)
        return df.to_string()

    def get_chunks(self, text: str) -> List[str]:
        # Semantic chunking (simple word-based split for now)
        # In production, use token-based split for higher accuracy
        words = text.split()
        chunks = []
        
        # Simple sliding window chunking
        i = 0
        while i < len(words):
            chunk = " ".join(words[i : i + self.chunk_size])
            chunks.append(chunk)
            i += (self.chunk_size - self.chunk_overlap)
            
        return chunks

    def clean_text(self, text: str) -> str:
        # Basic cleaning
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\.,!?-]', '', text)
        return text.strip()
