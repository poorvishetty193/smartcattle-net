# app/rag/vector_store.py

import faiss

from app.rag.documents import CATTLE_KNOWLEDGE
from app.rag.embeddings import get_embeddings, get_query_embedding


class CattleVectorStore:
    def __init__(self):
        self.documents = CATTLE_KNOWLEDGE

        texts = [doc["text"] for doc in self.documents]
        embeddings = get_embeddings(texts)

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

    def search(self, query: str, top_k: int = 3):
        query_embedding = get_query_embedding(query)

        scores, indices = self.index.search(query_embedding, top_k)

        results = []

        for score, index in zip(scores[0], indices[0]):
            if index == -1:
                continue

            results.append({
                "id": self.documents[index]["id"],
                "topic": self.documents[index]["topic"],
                "text": self.documents[index]["text"],
                "score": float(score),
            })

        return results


vector_store = CattleVectorStore()