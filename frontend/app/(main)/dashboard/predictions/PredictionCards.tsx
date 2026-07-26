"use client";

type PredictionResult = {
  stage1_daily_yield: number;
  stage7_productivity_score: number;
  stage8_stress_probability: number;
  stage11_health_score: number;
  stage12_risk_level: string;
  stage9_recommendation: string;
};

interface PredictionCardsProps {
  result: PredictionResult;
}

export default function PredictionCards({ result }: PredictionCardsProps) {
  const cards = [
    {
      title: "Daily Yield",
      value: `${result.stage1_daily_yield.toFixed(2)} L`,
    },
    {
      title: "Health Score",
      value: result.stage11_health_score.toFixed(2),
    },
    {
      title: "Stress Probability",
      value: result.stage8_stress_probability.toFixed(4),
    },
    {
      title: "Productivity",
      value: result.stage7_productivity_score.toFixed(2),
    },
    {
      title: "Risk Level",
      value: result.stage12_risk_level,
    },
    {
      title: "Recommendation",
      value: result.stage9_recommendation,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-xl shadow border p-6">
          <h3 className="text-gray-500 text-sm">{card.title}</h3>

          <p className="text-2xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
