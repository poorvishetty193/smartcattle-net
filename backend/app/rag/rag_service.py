# app/rag/rag_service.py

from app.rag.vector_store import vector_store


DEFAULT_TOP_K = 3
DEFAULT_MIN_SCORE = 0.40


def retrieve_knowledge(
    query: str,
    top_k: int = DEFAULT_TOP_K,
    min_score: float = DEFAULT_MIN_SCORE,
):
    """
    Retrieve relevant cattle knowledge from the FAISS vector store.
    """

    results = vector_store.search(query, top_k)

    filtered_results = [
        result
        for result in results
        if result["score"] >= min_score
    ]

    return filtered_results


def build_knowledge_context(
    query: str,
    top_k: int = DEFAULT_TOP_K,
    min_score: float = DEFAULT_MIN_SCORE,
):
    """
    Build a clean text context from retrieved knowledge.
    """

    results = retrieve_knowledge(
        query=query,
        top_k=top_k,
        min_score=min_score,
    )

    if not results:
        return ""

    context_parts = []

    for result in results:
        context_parts.append(
            f"Topic: {result['topic']}\n"
            f"Information: {result['text']}"
        )

    return "\n\n".join(context_parts)