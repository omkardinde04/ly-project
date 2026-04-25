import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os
import pickle
from typing import List, Dict

class VectorStore:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', index_path: str = 'faiss_index.idx'):
        self.model = SentenceTransformer(model_name)
        self.index_path = index_path
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks = [] # Map index IDs to text chunks
        
        # Load existing index if available
        if os.path.exists(self.index_path):
            self.load()

    def add_texts(self, texts: List[str], doc_id: str):
        if not texts:
            return
            
        embeddings = self.model.encode(texts)
        self.index.add(np.array(embeddings).astype('float32'))
        
        # Store metadata
        for text in texts:
            self.chunks.append({
                "text": text,
                "doc_id": doc_id
            })
        
        self.save()

    def search(self, query: str, k: int = 5):
        if self.index.ntotal == 0:
            return []
            
        query_vector = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), k)
        
        results = []
        for i in range(len(indices[0])):
            idx = indices[0][i]
            if idx < len(self.chunks) and idx != -1:
                results.append(self.chunks[idx])
        
        return results

    def save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.index_path + ".meta", "wb") as f:
            pickle.dump(self.chunks, f)

    def load(self):
        self.index = faiss.read_index(self.index_path)
        with open(self.index_path + ".meta", "rb") as f:
            self.chunks = pickle.load(f)
