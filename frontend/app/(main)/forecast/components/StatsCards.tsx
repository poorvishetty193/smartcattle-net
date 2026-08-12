"use client";

import { TrendingUp, Activity, AlertTriangle, Brain } from "lucide-react";

interface PredictionResponse {
  stage6_forecast?: {
    s6_forecast_7d?: number[];
    s6_forecast_7d_mean?: number;
    s6_trend_slope?: number;
    s6_trend_direction?: number;
  };

  stage12_risk_level?: string;
}

interface StatsCardsProps {
  prediction: PredictionResponse | null;
  loading: boolean;
}

export default function StatsCards({ prediction, loading }: StatsCardsProps) {
  const stage6 = prediction?.stage6_forecast;

  const trend =
    stage6?.s6_trend_direction === 1
      ? "Increasing"
      : stage6?.s6_trend_direction === -1
        ? "Decreasing"
        : stage6?.s6_trend_direction === 0
          ? "Stable"
          : "—";

  const risk = prediction?.stage12_risk_level ?? "—";

  const forecastMean = stage6?.s6_forecast_7d_mean;

  const stats = [
    {
      title: "7-Day Trend",
      value: loading ? "..." : trend,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "7-Day Forecast",
      value:
        loading || forecastMean === undefined
          ? "—"
          : `${forecastMean.toFixed(2)} kg/day`,
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Risk Score",
      value: loading ? "..." : risk,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "AI Confidence",
      value: "—",
      icon: Brain,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>

                <h2 className="mt-2 text-2xl font-bold">{item.value}</h2>
              </div>

              <Icon className={item.color} size={34} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
