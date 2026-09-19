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
from matplotlib import text
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

    Cow-specific questions are checked first so that
    questions such as "What is the risk level of C100?"
    get a specific answer instead of the generic cow summary.
    """

    text = message.lower().strip()

    # ---------------------------------------------------------
    # Cow-specific questions
    # ---------------------------------------------------------

    has_cow_id = re.search(
        r"\b(?:cow\s*)?[a-z]\d+\b",
        text,
    )

    if has_cow_id:

        # Cow risk
        if any(
                    phrase in text
                    for phrase in [
                        "risk level",
                        "risk score",
                        "risk status",
                        "how risky",
                        "is it risky",
                        "is the cow at risk",
                    ]
                ):
                
                    return "cow_risk"
        
        # Cow forecast
        if any(
    phrase in text
    for phrase in [
        "forecast",
        "milk forecast",
        "yield forecast",
        "milk trend",
        "production trend",
        "future yield",
        "next 7 days",
        "next seven days",
    ]
):
            return "cow_forecast"
           


        # Cow health
        if any(
            phrase in text
            for phrase in [
                "health score",
                "health status",
                "is healthy",
                "healthy",
                "unhealthy",
            ]
        ):
            return "cow_health"

        # Cow heat stress
        if any(
            phrase in text
            for phrase in [
                "heat stress",
                "heat-stress",
                "heat stressed",
                "under heat stress",
                "getting too hot",
                "too hot",
                "overheating",
                "overheated",
                "feeling hot",
                "temperature stress",
            ]
        ):
            return "cow_heat_stress"

        # Cow milk drop
        if any(
                phrase in text
                for phrase in [
                    "milk drop",
                    "milk-drop",
                    "production drop",
                    "dropping milk",
                    "milk production drop",
                    "milk production is dropping",
                    "at risk of a milk production drop",
                    "risk of milk production drop",
                    "milk decrease",
                    "milk decreases",
                    "milk decrease?",
                    "milk go down",
                    "milk going down",
                    "milk decline",
                    "milk declining",
                    "milk falling",
                    "milk reduce",
                    "milk reduction",
                    "milk reducing",
                                        
                ]
            ):
                return "cow_milk_drop"
           

        # Cow productivity
        if any(
            phrase in text
            for phrase in [
                "productivity",
                "productivity score",
                "productive",
            ]
        ):
            return "cow_productivity"

        # Cow forecast
        if any(
            phrase in text
            for phrase in [
                "forecast",
                "trend",
                "future yield",
                "next 7 days",
                "next seven days",
                "stay stable",
                "remain stable",
                "over the next few days",
                "next few days",
                "will milk production",
                "future milk production",
                "milk production in the coming days",
                "milk production over the next few days",
                            ]
        ):
            return "cow_forecast"


     # Cow milk production
        if any(
            phrase in text
            for phrase in [
                "predicted milk",
                "predicted yield",
                "milk yield",
                "daily yield",
                "milk production",
                "milk quantity",
                "next milking",
                "how much milk",
                "how much does",
                "how much is",
                "producing",
                "produce",
                "gives",
                "give",
            ]
        ):
            return "cow_milk"   
    # ---------------------------------------------------------
        # Milk drop
        # ---------------------------------------------------------
    
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

       
# ---------------------------------------------------------
    # Milk drop
    # ---------------------------------------------------------


    if any(
        phrase in text
        for phrase in [
             "milk drop",
        "milk-drop",
        "milk production drop",
        "production drop",
        "dropping milk",
        "milk production is dropping",
        "at risk of a milk production drop",
        "risk of milk production drop",
        ]
    ):
        return "milk_drop"
    # ---------------------------------------------------------
    # Farm-wide risk
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Heat stress
    # ---------------------------------------------------------

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


    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Attention
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Productivity
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Milk production
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # General farm / herd
    # ---------------------------------------------------------

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
async def get_cow_prediction_context(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
):
    cow_id = extract_cow_id(message)

    if cow_id is None:
        return None, None, None

    context = await build_cow_context(
        db=db,
        user_id=current_user.id,
        cow_id=cow_id,
    )

    if context is None:
        return cow_id, None, None

    return cow_id, context.get("cow", {}), context.get("latest_prediction")
async def answer_cow_risk(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_risk",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_risk",
            data={"cow_id": cow_id, "found": False},
        )

    if not prediction:
        return ChatResponse(
            answer=f"No prediction data is currently available for cow {cow_id}.",
            intent="cow_risk",
            data={"cow_id": cow_id, "prediction": None},
        )

    risk = prediction.get("risk", {})

    level = risk.get("level")
    score = risk.get("score")

    return ChatResponse(
        answer=(
            f"Cow {cow_id} has a {level} risk level "
            f"with a risk score of {_format_number(score)}."
        ),
        intent="cow_risk",
        data={
            "cow_id": cow_id,
            "risk": risk,
        },
    )
async def answer_cow_forecast(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_forecast",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_forecast",
            data={"cow_id": cow_id, "found": False},
        )

    if not prediction:
        return ChatResponse(
            answer=f"No forecast data is currently available for cow {cow_id}.",
            intent="cow_forecast",
            data={"cow_id": cow_id, "prediction": None},
        )

    milk = prediction.get("milk_production", {})

    forecast_mean = milk.get("forecast_mean_l")
    trend_slope = milk.get("trend_slope")
    trend_direction = milk.get("trend_direction")

    forecast = prediction.get("forecast")

    # The current prediction context stores the forecast summary
    # in milk_production. If the full 7-day forecast is available,
    # include it as well.
    forecast_values = None

    if isinstance(forecast, dict):
        forecast_values = forecast.get("s6_forecast_7d")

    if forecast_values is None:
        forecast_values = milk.get("forecast_7d")

    if trend_direction == 1:
        trend_text = "increasing"
    elif trend_direction == -1:
        trend_text = "decreasing"
    else:
        trend_text = "stable"

    answer = (
        f"Cow {cow_id}'s forecasted average daily milk yield is "
        f"{_format_number(forecast_mean)} L. "
        f"The current milk-yield trend is {trend_text}."
    )

    if trend_slope is not None:
        answer += (
            f" The trend slope is "
            f"{_format_number(trend_slope, 4)}."
        )

    if forecast_values:
        formatted_values = ", ".join(
            f"{_format_number(value)} L"
            for value in forecast_values
        )

        answer += (
            f" The 7-day forecast is: {formatted_values}."
        )

    return ChatResponse(
        answer=answer,
        intent="cow_forecast",
        data={
            "cow_id": cow_id,
            "forecast_mean_l": forecast_mean,
            "trend_slope": trend_slope,
            "trend_direction": trend_direction,
            "forecast_7d": forecast_values,
        },
    )    
async def answer_cow_milk(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_milk",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_milk",
            data={"cow_id": cow_id, "found": False},
        )

    if not prediction:
        return ChatResponse(
            answer=f"No milk prediction is currently available for cow {cow_id}.",
            intent="cow_milk",
        )

    milk = prediction.get("milk_production", {})

    daily_yield = milk.get("daily_yield_l")
    next_milking = milk.get("next_milking_l")

    return ChatResponse(
        answer=(
            f"Cow {cow_id}'s predicted daily milk yield is "
            f"{_format_number(daily_yield)} L. "
            f"The predicted next-milking yield is "
            f"{_format_number(next_milking)} L."
        ),
        intent="cow_milk",
        data={
            "cow_id": cow_id,
            "milk_production": milk,
        },
    )  
async def answer_cow_health(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_health",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_health",
        )

    if not prediction:
        return ChatResponse(
            answer=f"No health prediction is currently available for cow {cow_id}.",
            intent="cow_health",
        )

    health = prediction.get("health", {})
    score = health.get("score")

    return ChatResponse(
        answer=(
            f"Cow {cow_id} has a health score of "
            f"{_format_number(score)}."
        ),
        intent="cow_health",
        data={
            "cow_id": cow_id,
            "health": health,
        },
    )
async def answer_cow_heat_stress(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_heat_stress",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_heat_stress",
        )

    if not prediction:
        return ChatResponse(
            answer=f"No heat-stress prediction is currently available for cow {cow_id}.",
            intent="cow_heat_stress",
        )

    stress = prediction.get("heat_stress", {})
    flag = stress.get("flag")
    probability = stress.get("probability")

    if flag == 1:
        answer = (
            f"Cow {cow_id} is currently flagged for heat stress. "
            f"The predicted probability is {_percentage(probability)}."
        )
    else:
        answer = (
            f"Cow {cow_id} is not currently flagged for heat stress. "
            f"The predicted probability is {_percentage(probability)}."
        )

    return ChatResponse(
        answer=answer,
        intent="cow_heat_stress",
        data={
            "cow_id": cow_id,
            "heat_stress": stress,
        },
    )
async def answer_cow_milk_drop(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_milk_drop",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_milk_drop",
        )

    if not prediction:
        return ChatResponse(
            answer=f"No milk-drop prediction is currently available for cow {cow_id}.",
            intent="cow_milk_drop",
        )

    milk = prediction.get("milk_production", {})

    flag = milk.get("drop_flag")
    probability = milk.get("drop_probability")

    if flag == 1:
        answer = (
            f"Cow {cow_id} is currently flagged for a possible "
            f"milk production drop. The predicted probability is "
            f"{_percentage(probability)}."
        )
    else:
        answer = (
            f"Cow {cow_id} is not currently flagged for a milk "
            f"production drop. The predicted probability is "
            f"{_percentage(probability)}."
        )

    return ChatResponse(
        answer=answer,
        intent="cow_milk_drop",
        data={
            "cow_id": cow_id,
            "milk_production": milk,
        },
    )
async def answer_cow_productivity(
    message: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> ChatResponse:

    cow_id, cow, prediction = await get_cow_prediction_context(
        message, db, current_user
    )

    if cow_id is None:
        return ChatResponse(
            answer="Please provide a cow ID, for example C100.",
            intent="cow_productivity",
        )

    if cow is None:
        return ChatResponse(
            answer=f"I couldn't find cow {cow_id} in your active farm records.",
            intent="cow_productivity",
        )

    if not prediction:
        return ChatResponse(
            answer=f"No productivity prediction is currently available for cow {cow_id}.",
            intent="cow_productivity",
        )

    productivity = prediction.get("productivity", {})
    score = productivity.get("score")

    return ChatResponse(
        answer=(
            f"Cow {cow_id} has a productivity score of "
            f"{_format_number(score)}."
        ),
        intent="cow_productivity",
        data={
            "cow_id": cow_id,
            "productivity": productivity,
        },
    )

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
    if intent == "cow_risk":
        return await answer_cow_risk(
        message=message,
        db=db,
        current_user=current_user,
    )

    if intent == "cow_milk":
        return await answer_cow_milk(
        message=message,
        db=db,
        current_user=current_user,
    )

    if intent == "cow_health":
        return await answer_cow_health(
        message=message,
        db=db,
        current_user=current_user,
    )

    if intent == "cow_heat_stress":
        return await answer_cow_heat_stress(
        message=message,
        db=db,
        current_user=current_user,
    )

    if intent == "cow_milk_drop":
        return await answer_cow_milk_drop(
        message=message,
        db=db,
        current_user=current_user,
    )
    if intent == "cow_forecast":
        return await answer_cow_forecast(
        message=message,
        db=db,
        current_user=current_user,
    )    

    if intent == "cow_productivity":
        return await answer_cow_productivity(
        message=message,
        db=db,
        current_user=current_user,
    )

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