# app/rag/documents.py

CATTLE_KNOWLEDGE = [
    {
        "id": "milk_yield",
        "topic": "Milk Yield",
        "text": (
            "Milk yield is the amount of milk produced by a cow over a specified "
            "period. Daily milk yield can be used to monitor production and identify "
            "changes in a cow's productivity."
        ),
    },
    {
        "id": "milk_drop",
        "topic": "Milk Production Drop",
        "text": (
            "A decrease in milk production can indicate changes in cow health, "
            "nutrition, heat stress, environmental conditions, or other factors. "
            "Monitoring milk production trends can help identify cows that may need "
            "attention."
        ),
    },
    {
        "id": "heat_stress",
        "topic": "Heat Stress",
        "text": (
            "Heat stress occurs when cattle experience environmental conditions "
            "that make it difficult to maintain normal body temperature. High "
            "temperature and humidity can increase heat stress risk. Heat stress "
            "may affect feed intake, activity, health, and milk production."
        ),
    },
    {
        "id": "health_score",
        "topic": "Cow Health",
        "text": (
            "A cow health score is a numerical indicator used to represent the "
            "overall health condition of a cow. Lower health scores may indicate "
            "that a cow requires closer monitoring or veterinary attention."
        ),
    },
    {
        "id": "productivity",
        "topic": "Productivity",
        "text": (
            "Cow productivity can be evaluated using milk production and other "
            "farm measurements. Productivity monitoring helps identify high- and "
            "low-performing animals."
        ),
    },
    {
        "id": "rumination",
        "topic": "Rumination",
        "text": (
            "Rumination is the process in which cattle regurgitate and rechew "
            "feed. Changes in rumination activity can provide useful information "
            "about feeding behavior and the condition of cattle."
        ),
    },
    {
        "id": "feed_intake",
        "topic": "Feed Intake",
        "text": (
            "Feed intake is an important factor in cattle production. Adequate "
            "feed intake supports milk production, growth, and overall animal "
            "condition."
        ),
    },
    {
        "id": "water_intake",
        "topic": "Water Intake",
        "text": (
            "Water is essential for cattle health and milk production. Monitoring "
            "water intake can help identify changes in normal drinking behavior."
        ),
    },
    {
        "id": "milk_forecasting",
        "topic": "Milk Forecasting",
        "text": (
            "Milk forecasting estimates future milk production using historical "
            "and current production information. A stable forecast trend indicates "
            "that predicted production remains relatively consistent over the "
            "forecast period."
        ),
    },
    {
        "id": "milk_stability",
        "topic": "Milk Stability Index",
        "text": (
            "A milk stability index is a numerical measure used to represent the "
            "stability of milk production. Higher stability indicates more "
            "consistent predicted production."
        ),
    },
    {
        "id": "days_in_milk",
        "topic": "Days in Milk",
        "text": (
            "Days in milk represents the number of days since a cow started its "
            "current lactation. It is an important factor when interpreting milk "
            "production and lactation performance."
        ),
    },
    {
        "id": "lactation",
        "topic": "Lactation",
        "text": (
            "Lactation number represents the number of lactation cycles a cow has "
            "completed. Lactation stage can affect milk production and other "
            "performance measurements."
        ),
    },
]