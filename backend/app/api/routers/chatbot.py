"""
SmartCattle Net

api/routers/chatbot.py

Farm-aware chatbot API.

Current layer:
    User question
        ↓
    Intent detection
        ↓
    PostgreSQL farm-context retrieval
        ↓
    Grounded response

Later:
    PostgreSQL context + FAISS RAG
        ↓
    LangChain
        ↓
    Ollama / Gemini
        ↓
    AI response
"""

from __future__ import annotations

import re
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, SessionDep
from app.services.chat_context import (
    build_cow_context,
    build_farm_context,
)


router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


# =============================================================
# REQUEST / RESPONSE
# =============================================================


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )


class ChatResponse(BaseModel):
    answer: str
    source: str = "SmartCattleNet farm data"
    intent: str
    data: dict[str, Any] = Field(
        default_factory=dict
    )


# =============================================================
# INTENT DETECTION
# =============================================================


def detect_intent(message: str) -> str:
    """
    Determine what kind of farm question the user asked.

    This is intentionally simple for now.
    Later LangChain / LLM query understanding can replace this.
    """

    text = message.lower().strip()

    # Specific cow question
    if re.search(
        r"\b(?:cow\s*)?[a-z]\d+\b",
        text,
    ):
        return "cow"

    # Risk
    if any(
        phrase in text
        for phrase in [
            "high risk",
            "high-risk",
            "at risk",
            "risk cows",
            "risky cows",
            "risk level",
            "risk score",
        ]
    ):
        return "risk"

    # Heat stress
    if any(
        phrase in text
        for phrase in [
            "heat stress",
            "heat-stress",
            "heat stressed",
            "heat stress cows",
            "stress cows",
        ]
    ):
        return "heat_stress"

    # Milk drop
    if any(
        phrase in text
        for phrase in [
            "milk drop",
            "milk-drop",
            "milk production drop",
            "production drop",
            "dropping milk",
        ]
    ):
        return "milk_drop"

    # Health
    if any(
        phrase in text
        for phrase in [
            "health score",
            "low health",
            "health status",
            "unhealthy cows",
            "unhealthy",
        ]
    ):
        return "health"

    # Attention
    if any(
        phrase in text
        for phrase in [
            "need attention",
            "needs attention",
            "requires attention",
            "farm attention",
            "pay attention",
            "attention",
        ]
    ):
        return "attention"

    # Productivity
    if any(
        phrase in text
        for phrase in [
            "productivity",
            "productive cows",
            "most productive",
            "least productive",
        ]
    ):
        return "productivity"

    # Milk production
    if any(
        phrase in text
        for phrase in [
            "milk production",
            "milk yield",
            "daily yield",
            "milk quantity",
            "milk forecast",
            "production trend",
            "milk trend",
        ]
    ):
        return "milk_production"

    # General farm / herd
    if any(
        phrase in text
        for phrase in [
            "how is my farm",
            "how is my herd",
            "farm status",
            "herd status",
            "farm doing",
            "herd doing",
            "farm summary",
            "herd summary",
            "overall farm",
            "overall herd",
        ]
    ):
        return "farm_summary"

    return "general"


# =============================================================
# FORMATTING HELPERS
# =============================================================


def _format_number(
    value: Any,
    decimals: int = 1,
) -> str:
    if value is None:
        return "N/A"

    try:
        return f"{float(value):.{decimals}f}"
    except (TypeError, ValueError):
        return "N/A"


def _percentage(
    value: Any,
) -> str:
    if value is None:
        return "N/A"

    try:
        number = float(value)

        # Probability values are stored between 0 and 1.
        if 0 <= number <= 1:
            number *= 100

        return f"{number:.1f}%"

    except (TypeError, ValueError):
        return "N/A"


# =============================================================
# RISK ANSWER
# =============================================================


def answer_risk(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    high_risk = [
        prediction
        for prediction in predictions
        if str(
            prediction.get("risk", {}).get("level") or ""
        ).lower()
        == "high"
    ]

    if not high_risk:
        return ChatResponse(
            answer=(
                "I couldn't find any cows currently "
                "classified as high risk in the latest "
                "available predictions."
            ),
            intent="risk",
            data={
                "count": 0,
                "cows": [],
            },
        )

    cows = []

    for prediction in high_risk:
        risk = prediction.get(
            "risk",
            {},
        )

        cows.append(
            {
                "cow_id": prediction.get("cow_id"),
                "risk_level": risk.get("level"),
                "risk_score": risk.get("score"),
            }
        )

    names = ", ".join(
        str(cow["cow_id"])
        for cow in cows
    )

    return ChatResponse(
        answer=(
            f"I found {len(cows)} cow(s) classified "
            f"as high risk: {names}."
        ),
        intent="risk",
        data={
            "count": len(cows),
            "cows": cows,
        },
    )


# =============================================================
# HEAT STRESS ANSWER
# =============================================================


def answer_heat_stress(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    stressed = [
        prediction
        for prediction in predictions
        if prediction.get(
            "heat_stress",
            {},
        ).get("flag")
        == 1
    ]

    if not stressed:
        return ChatResponse(
            answer=(
                "I couldn't find any cows currently "
                "flagged for heat stress."
            ),
            intent="heat_stress",
            data={
                "count": 0,
                "cows": [],
            },
        )

    cows = []

    for prediction in stressed:
        stress = prediction.get(
            "heat_stress",
            {},
        )

        cows.append(
            {
                "cow_id": prediction.get("cow_id"),
                "probability": stress.get(
                    "probability"
                ),
            }
        )

    names = ", ".join(
        str(cow["cow_id"])
        for cow in cows
    )

    return ChatResponse(
        answer=(
            f"{len(cows)} cow(s) are currently "
            f"flagged for heat stress: {names}."
        ),
        intent="heat_stress",
        data={
            "count": len(cows),
            "cows": cows,
        },
    )


# =============================================================
# MILK DROP ANSWER
# =============================================================


def answer_milk_drop(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    drops = [
        prediction
        for prediction in predictions
        if prediction.get(
            "milk_production",
            {},
        ).get("drop_flag")
        == 1
    ]

    if not drops:
        return ChatResponse(
            answer=(
                "I couldn't find any cows currently "
                "flagged for a predicted milk production drop."
            ),
            intent="milk_drop",
            data={
                "count": 0,
                "cows": [],
            },
        )

    cows = []

    for prediction in drops:

        milk = prediction.get(
            "milk_production",
            {},
        )

        cows.append(
            {
                "cow_id": prediction.get("cow_id"),
                "drop_probability": milk.get(
                    "drop_probability"
                ),
            }
        )

    names = ", ".join(
        str(cow["cow_id"])
        for cow in cows
    )

    return ChatResponse(
        answer=(
            f"{len(cows)} cow(s) are flagged for "
            f"a possible milk production drop: {names}."
        ),
        intent="milk_drop",
        data={
            "count": len(cows),
            "cows": cows,
        },
    )


# =============================================================
# HEALTH ANSWER
# =============================================================


def answer_health(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    low_health = []

    for prediction in predictions:

        health = prediction.get(
            "health",
            {},
        )

        score = health.get("score")

        if score is not None:

            try:
                if float(score) < 50:

                    low_health.append(
                        {
                            "cow_id": prediction.get(
                                "cow_id"
                            ),
                            "health_score": float(score),
                        }
                    )

            except (TypeError, ValueError):
                continue

    if not low_health:
        return ChatResponse(
            answer=(
                "I couldn't find any cows with a "
                "health score below 50."
            ),
            intent="health",
            data={
                "count": 0,
                "cows": [],
            },
        )

    description = ", ".join(
        f"{cow['cow_id']} "
        f"({_format_number(cow['health_score'])})"
        for cow in low_health
    )

    return ChatResponse(
        answer=(
            f"I found {len(low_health)} cow(s) "
            f"with a health score below 50: "
            f"{description}."
        ),
        intent="health",
        data={
            "count": len(low_health),
            "cows": low_health,
        },
    )


# =============================================================
# ATTENTION ANSWER
# =============================================================


def answer_attention(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    attention = [
        prediction
        for prediction in predictions
        if prediction.get(
            "farm_decision",
            {},
        ).get("attention")
        == 1
    ]

    if not attention:
        return ChatResponse(
            answer=(
                "No cows are currently flagged "
                "as requiring farm attention."
            ),
            intent="attention",
            data={
                "count": 0,
                "cows": [],
            },
        )

    cows = [
        prediction.get("cow_id")
        for prediction in attention
    ]

    return ChatResponse(
        answer=(
            f"{len(cows)} cow(s) currently require "
            f"farm attention: "
            f"{', '.join(map(str, cows))}."
        ),
        intent="attention",
        data={
            "count": len(cows),
            "cows": cows,
        },
    )


# =============================================================
# PRODUCTIVITY ANSWER
# =============================================================


def answer_productivity(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    cows = []

    for prediction in predictions:

        productivity = prediction.get(
            "productivity",
            {},
        ).get("score")

        if productivity is not None:
            cows.append(
                {
                    "cow_id": prediction.get(
                        "cow_id"
                    ),
                    "score": productivity,
                }
            )

    cows.sort(
        key=lambda item: float(item["score"]),
        reverse=True,
    )

    if not cows:
        return ChatResponse(
            answer=(
                "There is no productivity score "
                "available in the current prediction data."
            ),
            intent="productivity",
            data={
                "count": 0,
                "cows": [],
            },
        )

    top_cows = cows[:5]

    description = ", ".join(
        f"{cow['cow_id']} "
        f"({ _format_number(cow['score']) })"
        for cow in top_cows
    )

    return ChatResponse(
        answer=(
            "The highest productivity scores in the "
            f"latest predictions are: {description}."
        ),
        intent="productivity",
        data={
            "count": len(cows),
            "cows": cows,
        },
    )


# =============================================================
# MILK PRODUCTION ANSWER
# =============================================================


def answer_milk_production(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        [],
    )

    cows = []

    for prediction in predictions:

        milk = prediction.get(
            "milk_production",
            {},
        )

        yield_value = milk.get(
            "daily_yield_l"
        )

        if yield_value is not None:

            cows.append(
                {
                    "cow_id": prediction.get(
                        "cow_id"
                    ),
                    "daily_yield_l": yield_value,
                    "forecast_mean_l": milk.get(
                        "forecast_mean_l"
                    ),
                    "trend_slope": milk.get(
                        "trend_slope"
                    ),
                    "trend_direction": milk.get(
                        "trend_direction"
                    ),
                }
            )

    if not cows:
        return ChatResponse(
            answer=(
                "There is no milk-production data "
                "available in the current predictions."
            ),
            intent="milk_production",
            data={
                "count": 0,
                "cows": [],
            },
        )

    total_yield = sum(
        float(cow["daily_yield_l"])
        for cow in cows
        if cow["daily_yield_l"] is not None
    )

    return ChatResponse(
        answer=(
            f"The latest available predictions contain "
            f"milk-yield data for {len(cows)} cow(s), "
            f"with a combined predicted daily yield of "
            f"{total_yield:.2f} L."
        ),
        intent="milk_production",
        data={
            "count": len(cows),
            "total_predicted_daily_yield_l": total_yield,
            "cows": cows,
        },
    )


# =============================================================
# FARM SUMMARY
# =============================================================


def answer_farm_summary(
    context: dict[str, Any],
) -> ChatResponse:

    predictions = context.get(
        "latest_predictions",
        []
    )

    high_risk = sum(
        1
        for prediction in predictions
        if str(
            prediction.get(
                "risk",
                {},
            ).get("level")
            or ""
        ).lower()
        == "high"
    )

    heat_stress = sum(
        1
        for prediction in predictions
        if prediction.get(
            "heat_stress",
            {},
        ).get("flag")
        == 1
    )

    milk_drop = sum(
        1
        for prediction in predictions
        if prediction.get(
            "milk_production",
            {},
        ).get("drop_flag")
        == 1
    )

    attention = sum(
        1
        for prediction in predictions
        if prediction.get(
            "farm_decision",
            {},
        ).get("attention")
        == 1
    )

    farm = context.get(
        "farm"
    ) or {}

    farm_name = (
        farm.get("farm_name")
        or "your farm"
    )

    return ChatResponse(
        answer=(
            f"Here is the latest SmartCattleNet "
            f"summary for {farm_name}: "
            f"{len(predictions)} cow prediction(s) "
            f"are available. "
            f"{high_risk} are high risk, "
            f"{heat_stress} are flagged for heat stress, "
            f"{milk_drop} have a predicted milk drop, "
            f"and {attention} require farm attention."
        ),
        intent="farm_summary",
        data={
            "farm": farm,
            "prediction_count": len(predictions),
            "high_risk": high_risk,
            "heat_stress": heat_stress,
            "milk_drop": milk_drop,
            "attention": attention,
        },
    )


# =============================================================
# SPECIFIC COW
# =============================================================


def extract_cow_id(
    message: str,
) -> str | None:
    """
    Extract IDs such as:

        C01
        C04
        C100

    from a user message.
    """

    match = re.search(
        r"\b(?:cow\s*)?([A-Za-z]\d+)\b",
        message,
        flags=re.IGNORECASE,
    )

    if not match:
        return None

    return match.group(1).upper()


async def answer_cow_question(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id = extract_cow_id(message)

    if cow_id is None:
        return ChatResponse(
            answer=(
                "Please provide a cow ID, for example "
                "\"Tell me about C01\"."
            ),
            intent="cow",
            data={},
        )

    context = await build_cow_context(
        db=db,
        user_id=current_user.id,
        cow_id=cow_id,
    )

    if context is None:
        return ChatResponse(
            answer=(
                f"I couldn't find cow {cow_id} "
                "in your active farm records."
            ),
            intent="cow",
            data={
                "cow_id": cow_id,
                "found": False,
            },
        )

    cow = context.get(
        "cow",
        {}
    )

    prediction = context.get(
        "latest_prediction"
    )

    answer_parts = [
        f"Here is the latest available information "
        f"for cow {cow_id}."
    ]

    if cow.get("breed"):
        answer_parts.append(
            f"Breed: {cow['breed']}."
        )

    if cow.get("parity") is not None:
        answer_parts.append(
            f"Parity: {cow['parity']}."
        )

    if cow.get("days_in_milk") is not None:
        answer_parts.append(
            f"Days in milk: {cow['days_in_milk']}."
        )

    if prediction:

        risk = prediction.get(
            "risk",
            {}
        )

        health = prediction.get(
            "health",
            {}
        )

        milk = prediction.get(
            "milk_production",
            {}
        )

        stress = prediction.get(
            "heat_stress",
            {}
        )

        if risk.get("level"):
            answer_parts.append(
                f"Risk level: {risk['level']}."
            )

        if risk.get("score") is not None:
            answer_parts.append(
                f"Risk score: "
                f"{_format_number(risk['score'])}."
            )

        if health.get("score") is not None:
            answer_parts.append(
                f"Health score: "
                f"{_format_number(health['score'])}."
            )

        if milk.get("daily_yield_l") is not None:
            answer_parts.append(
                f"Predicted daily yield: "
                f"{_format_number(milk['daily_yield_l'])} L."
            )

        if milk.get("drop_flag") == 1:
            answer_parts.append(
                "A milk production drop is flagged."
            )

        if stress.get("flag") == 1:
            answer_parts.append(
                "Heat stress is flagged."
            )

        if prediction.get(
            "farm_decision",
            {},
        ).get("attention") == 1:
            answer_parts.append(
                "The cow currently requires farm attention."
            )

    else:
        answer_parts.append(
            "There is no prediction record available "
            "for this cow yet."
        )

    return ChatResponse(
        answer=" ".join(answer_parts),
        intent="cow",
        data=context,
    )


# =============================================================
# MAIN ENDPOINT
# =============================================================


@router.post(
    "",
    response_model=ChatResponse,
)
async def chat(
    request: ChatRequest,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    intent = detect_intent(message)

    # ---------------------------------------------------------
    # Specific cow
    # ---------------------------------------------------------

    if intent == "cow":
        return await answer_cow_question(
            message=message,
            db=db,
            current_user=current_user,
        )

    # ---------------------------------------------------------
    # Retrieve farm context
    # ---------------------------------------------------------

    context = await build_farm_context(
        db=db,
        user_id=current_user.id,
    )

    # ---------------------------------------------------------
    # Intent handlers
    # ---------------------------------------------------------

    if intent == "risk":
        return answer_risk(context)

    if intent == "heat_stress":
        return answer_heat_stress(context)

    if intent == "milk_drop":
        return answer_milk_drop(context)

    if intent == "health":
        return answer_health(context)

    if intent == "attention":
        return answer_attention(context)

    if intent == "productivity":
        return answer_productivity(context)

    if intent == "milk_production":
        return answer_milk_production(context)

    if intent == "farm_summary":
        return answer_farm_summary(context)

    # ---------------------------------------------------------
    # General question
    # ---------------------------------------------------------

    return ChatResponse(
        answer=(
            "I'm your SmartCattleNet farm assistant. "
            "I can currently answer questions about your "
            "cows, risk levels, heat stress, milk drops, "
            "health scores, productivity, milk production, "
            "and farm attention."
        ),
        intent="general",
        data={
            "available_topics": [
                "cow information",
                "risk",
                "heat stress",
                "milk drop",
                "health",
                "attention",
                "productivity",
                "milk production",
                "farm summary",
            ]
        },
    )