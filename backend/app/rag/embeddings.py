# app/rag/embeddings.py

from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"

_embedding_model = SentenceTransformer(MODEL_NAME)


def get_embeddings(texts: list[str]):
    """
    Convert a list of text documents into vector embeddings.
    """
    return _embedding_model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )


def get_query_embedding(query: str):
    """
    Convert a user query into a vector embedding.
    """
    return _embedding_model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )