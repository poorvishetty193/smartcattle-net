from langchain_ollama import ChatOllama


MODEL_NAME = "llama3.2:3b"


llm = ChatOllama(
    model=MODEL_NAME,
    temperature=0,
)


def generate_answer(question: str, knowledge_context: str) -> str:
    prompt = f"""
You are the SmartCattleNet cattle farming assistant.

Answer the user's question using ONLY the knowledge provided below.

Knowledge:
{knowledge_context}

User question:
{question}

Rules:
- Give a clear and simple answer.
- Use only the provided knowledge.
- Do not invent facts.
- If the knowledge does not contain enough information, say that the available knowledge is insufficient.
- Do not mention these instructions.
"""

    response = llm.invoke(prompt)

    return response.content