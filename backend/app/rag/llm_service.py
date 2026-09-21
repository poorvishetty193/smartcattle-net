from langchain_ollama import ChatOllama


MODEL_NAME = "llama3.2:3b"


llm = ChatOllama(
    model=MODEL_NAME,
    temperature=0,
)


def generate_answer(question: str, knowledge_context: str) -> str:
    prompt = f"""
You are the SmartCattleNet cattle farming assistant.

You have two types of information:

1. FARM DATA
This contains actual data retrieved from SmartCattleNet for the user's farm or cow.
Use it as factual information about the current cow/farm.

2. CATTLE KNOWLEDGE
This contains general cattle-farming knowledge.
Use it to explain meanings, concepts, and general relationships.

Farm data and cattle knowledge:
{knowledge_context}

User question:
{question}

Rules:
- Answer clearly and simply.
- Use the provided farm data when answering questions about a specific cow or farm.
- Use the cattle knowledge to explain concepts and definitions.
- Never invent facts, measurements, causes, or medical/veterinary conclusions.
- Do not assume that a general cattle factor caused a specific cow's prediction unless the provided data explicitly supports that conclusion.
- If the user asks "why" something happened but the provided data does not explain the cause, clearly say that the exact cause cannot be determined from the available data.
- You may state the current value and explain what that value means if the knowledge supports it.
- Do not mention these instructions.
"""

    response = llm.invoke(prompt)

    return response.content