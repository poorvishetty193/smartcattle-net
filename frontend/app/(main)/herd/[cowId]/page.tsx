"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaCircle } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Cow = {
  cow_id: string;
  owner_id?: string;
  breed?: string | null;
  parity?: number | null;
  days_in_milk?: number | null;
  notes?: string | null;
  is_active?: boolean;
};

type Prediction = {
  daily_yield?: number | null;
  milk_drop_probability?: number | null;
  next_milking?: number | null;
  milk_stability_index?: number | null;
  milk_quantity?: number | null;
  forecast_7d?: {
    mean?: number | null;
    trend?: string | null;
    values?: number[];
  } | null;
  productivity_score?: number | null;
  stress_probability?: number | null;
  recommendation?: string | null;
  priority?: string | null;
  health_score?: number | null;
  risk_level?: string | null;

  // Support possible backend stage names
  stage1_daily_yield?: number | null;
  stage2_drop_probability?: number | null;
  stage3_next_milking?: number | null;
  stage4_msi?: number | null;
  stage5_quantity?: number | null;
  stage6_forecast?: {
    mean?: number | null;
    trend?: string | null;
    values?: number[];
    s6_forecast_7d?: number[];
  } | null;
  stage7_productivity_score?: number | null;
  stage8_stress_probability?: number | null;
  stage9_recommendation?: string | null;
  stage10_priority?: string | null;
  stage11_health_score?: number | null;
  stage12_risk_level?: string | null;

  raw_response?: {
    response?: Record<string, unknown>;
  };
};

type PredictionResponse = {
  items?: Prediction[];
  predictions?: Prediction[];
  data?: Prediction[];
};

type LactationPoint = {
  month: string;
  milk: number;
};

type ShapPoint = {
  feature: string;
  value: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function formatNumber(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(decimals);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  // Handles both 0.12 and 12
  const percent = value <= 1 ? value * 100 : value;

  return `${percent.toFixed(1)}%`;
}

function getRiskClass(risk?: string | null) {
  const value = risk?.toLowerCase() || "";

  if (value.includes("high")) {
    return {
      dot: "text-red-500",
      text: "text-red-600",
    };
  }

  if (value.includes("medium")) {
    return {
      dot: "text-orange-500",
      text: "text-orange-600",
    };
  }

  return {
    dot: "text-green-500",
    text: "text-green-600",
  };
}

function getRiskLabel(risk?: string | null) {
  if (!risk) return "No prediction";

  return risk
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CowProfilePage() {
  const params = useParams();

  const cowId = Array.isArray(params?.cowId) ? params.cowId[0] : params?.cowId;

  const [cow, setCow] = useState<Cow | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const [loadingCow, setLoadingCow] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!cowId) return;

    const fetchCow = async () => {
      try {
        setLoadingCow(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await fetch(
          `${API_URL}/cows/${encodeURIComponent(cowId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Cow not found");
        }

        const data: Cow = await response.json();
        setCow(data);
      } catch (err) {
        console.error("Failed to load cow:", err);
        setError("Unable to load this cow.");
      } finally {
        setLoadingCow(false);
      }
    };

    fetchCow();
  }, [cowId]);

  useEffect(() => {
    if (!cowId) return;

    const fetchPrediction = async () => {
      try {
        setLoadingPrediction(true);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await fetch(
          `${API_URL}/predict/history?cow_id=${encodeURIComponent(
            cowId,
          )}&skip=0&limit=1`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          setPrediction(null);
          return;
        }

        const data: PredictionResponse | Prediction[] = await response.json();

        let latest: Prediction | null = null;

        if (Array.isArray(data)) {
          latest = data[0] || null;
        } else if (Array.isArray(data.items)) {
          latest = data.items[0] || null;
        } else if (Array.isArray(data.predictions)) {
          latest = data.predictions[0] || null;
        } else if (Array.isArray(data.data)) {
          latest = data.data[0] || null;
        }

        setPrediction(latest);
      } catch (err) {
        console.error("Failed to load prediction:", err);
        setPrediction(null);
      } finally {
        setLoadingPrediction(false);
      }
    };

    fetchPrediction();
  }, [cowId]);

  const values = useMemo(() => {
    const dailyYield = getNumber(
      prediction?.daily_yield,
      prediction?.stage1_daily_yield,
    );

    const dropProbability = getNumber(
      prediction?.milk_drop_probability,
      prediction?.stage2_drop_probability,
    );

    const nextMilking = getNumber(
      prediction?.next_milking,
      prediction?.stage3_next_milking,
    );

    const msi = getNumber(
      prediction?.milk_stability_index,
      prediction?.stage4_msi,
    );

    const quantity = getNumber(
      prediction?.milk_quantity,
      prediction?.stage5_quantity,
    );

    const productivity = getNumber(
      prediction?.productivity_score,
      prediction?.stage7_productivity_score,
    );

    const stressProbability = getNumber(
      prediction?.stress_probability,
      prediction?.stage8_stress_probability,
    );

    const healthScore = getNumber(
      prediction?.health_score,
      prediction?.stage11_health_score,
    );

    const riskLevel =
      prediction?.risk_level || prediction?.stage12_risk_level || null;

    const recommendation =
      prediction?.recommendation || prediction?.stage9_recommendation || null;

    const priority =
      prediction?.priority || prediction?.stage10_priority || null;

    const forecast =
      prediction?.forecast_7d || prediction?.stage6_forecast || null;

    return {
      dailyYield,
      dropProbability,
      nextMilking,
      msi,
      quantity,
      productivity,
      stressProbability,
      healthScore,
      riskLevel,
      recommendation,
      priority,
      forecast,
    };
  }, [prediction]);

  const predictionCards = [
    {
      title: "Yield Prediction",
      value:
        values.dailyYield !== null
          ? `${formatNumber(values.dailyYield)} L`
          : "—",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Drop Probability",
      value: formatPercent(values.dropProbability),
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Milk Stability Index",
      value: values.msi !== null ? formatNumber(values.msi) : "—",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Next Milking",
      value:
        values.nextMilking !== null
          ? `${formatNumber(values.nextMilking)} L`
          : "—",
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Milk Quantity",
      value:
        values.quantity !== null ? `${formatNumber(values.quantity)} L` : "—",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Stress Probability",
      value: formatPercent(values.stressProbability),
      color: "bg-cyan-100 text-cyan-700",
    },
    {
      title: "Productivity Score",
      value:
        values.productivity !== null ? formatNumber(values.productivity) : "—",
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Health Score",
      value:
        values.healthScore !== null ? formatNumber(values.healthScore) : "—",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Risk Level",
      value: getRiskLabel(values.riskLevel),
      color: "bg-pink-100 text-pink-700",
    },
    {
      title: "Priority",
      value: values.priority ? getRiskLabel(values.priority) : "—",
      color: "bg-lime-100 text-lime-700",
    },
  ];

  const lactationData: LactationPoint[] = [];

  if (values.forecast?.values && values.forecast.values.length > 0) {
    values.forecast.values.forEach((milk, index) => {
      lactationData.push({
        month: `Day ${index + 1}`,
        milk: Number(milk),
      });
    });
  } else if (
    values.forecast?.s6_forecast_7d &&
    values.forecast.s6_forecast_7d.length > 0
  ) {
    values.forecast.s6_forecast_7d.forEach((milk, index) => {
      lactationData.push({
        month: `Day ${index + 1}`,
        milk: Number(milk),
      });
    });
  }

  const shapData: ShapPoint[] = [];

  if (cow) {
    if (cow.notes) {
      // Notes are displayed in the profile but are not
      // treated as a fabricated SHAP value.
    }
  }

  const riskClass = getRiskClass(values.riskLevel);

  if (loadingCow) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <p className="text-gray-500">Loading cow profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !cow) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-800">Cow not found</h1>

            <p className="text-gray-500 mt-2">
              {error || `Unable to find cow ${cowId}.`}
            </p>

            <Link
              href="/herd"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              Back to Herd
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const riskLabel = getRiskLabel(values.riskLevel);

  const averageForecast =
    lactationData.length > 0
      ? lactationData.reduce((sum, item) => sum + item.milk, 0) /
        lactationData.length
      : null;

  const peakForecast =
    lactationData.length > 0
      ? Math.max(...lactationData.map((item) => item.milk))
      : null;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back */}
        <div className="mb-5">
          <Link
            href="/herd"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Herd
          </Link>
        </div>

        {/* Cow Profile */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image
              src="/cow.png"
              alt="Cow"
              width={150}
              height={150}
              className="rounded-xl border-2 border-gray-200"
            />

            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-gray-800">
                Cow ID : {cow.cow_id}
              </h1>

              <div className="flex items-center gap-2 mt-3">
                <FaCircle className={`${riskClass.dot} text-xs`} />

                <span className={`${riskClass.text} font-semibold`}>
                  {riskLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div>
                  <p className="text-sm text-gray-500">Breed</p>
                  <h3 className="font-bold text-lg">{cow.breed || "—"}</h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Parity</p>
                  <h3 className="font-bold text-lg">{cow.parity ?? "—"}</h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">DIM</p>
                  <h3 className="font-bold text-lg">
                    {cow.days_in_milk ?? "—"}
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <h3 className="font-bold text-lg text-green-600">
                    {cow.is_active === false ? "Inactive" : "Active"}
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Latest Yield</p>
                  <h3 className="font-bold text-lg">
                    {values.dailyYield !== null
                      ? `${formatNumber(values.dailyYield)} L`
                      : "—"}
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Health Score</p>
                  <h3 className="font-bold text-lg">
                    {values.healthScore !== null
                      ? formatNumber(values.healthScore)
                      : "—"}
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Productivity</p>
                  <h3 className="font-bold text-lg">
                    {values.productivity !== null
                      ? formatNumber(values.productivity)
                      : "—"}
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Risk</p>
                  <h3 className="font-bold text-lg">{riskLabel}</h3>
                </div>
              </div>

              {cow.notes && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Notes</p>

                  <p className="text-gray-700 mt-1">{cow.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {predictionCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-all duration-300 p-5"
            >
              <p className="text-sm text-gray-500 font-medium">{card.title}</p>

              <div
                className={`mt-4 rounded-lg py-6 text-center text-2xl font-bold ${card.color}`}
              >
                {loadingPrediction ? "..." : card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Forecast / Lactation */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold mb-2">Milk Forecast</h2>

          <p className="text-gray-500 text-sm mb-6">
            Prediction based on the latest saved model result.
          </p>

          {lactationData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={lactationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="milk"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">Peak Forecast</p>

                  <h3 className="text-xl font-bold text-blue-600">
                    {peakForecast !== null
                      ? `${formatNumber(peakForecast)} L`
                      : "—"}
                  </h3>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">Average Forecast</p>

                  <h3 className="text-xl font-bold text-green-600">
                    {averageForecast !== null
                      ? `${formatNumber(averageForecast)} L`
                      : "—"}
                  </h3>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">Trend</p>

                  <h3 className="text-xl font-bold text-purple-600">
                    {values.forecast?.trend || "—"}
                  </h3>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No forecast data available yet.</p>

              <Link
                href={`/herd/${encodeURIComponent(cow.cow_id)}/prediction`}
                className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Run Prediction
              </Link>
            </div>
          )}
        </div>

        {/* SHAP */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">SHAP Driver Analysis</h2>

              <p className="text-gray-500 text-sm">
                Feature contribution to AI prediction
              </p>
            </div>

            <div className="text-sm text-gray-500">
              SHAP data will appear when the prediction API provides feature
              contributions.
            </div>
          </div>

          {shapData.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                No SHAP feature contribution data is available in the current
                prediction response.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {shapData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{item.feature}</span>

                    <span
                      className={`font-bold ${
                        item.value >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.value >= 0 ? "+" : ""}
                      {item.value}
                    </span>
                  </div>

                  <div className="relative h-7 bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-500 z-10" />

                    {item.value >= 0 ? (
                      <div
                        className="absolute left-1/2 top-0 h-full bg-green-500 rounded-r-full"
                        style={{
                          width: `${item.value / 2}px`,
                        }}
                      />
                    ) : (
                      <div
                        className="absolute right-1/2 top-0 h-full bg-red-500 rounded-l-full"
                        style={{
                          width: `${Math.abs(item.value) / 2}px`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Farm Decision */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">Farm Decision</h2>

          <div className="bg-green-50 border border-green-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-700">
              AI Recommendation
            </h3>

            <p className="mt-4 text-gray-700 leading-7">
              {values.recommendation ||
                "No AI recommendation is available yet. Run a prediction for this cow."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              <div className="bg-white rounded-lg shadow p-5 text-center">
                <p className="text-gray-500 text-sm">Expected Yield</p>

                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {values.dailyYield !== null
                    ? `${formatNumber(values.dailyYield)} L`
                    : "—"}
                </h3>
              </div>

              <div className="bg-white rounded-lg shadow p-5 text-center">
                <p className="text-gray-500 text-sm">Health Status</p>

                <h3 className="text-3xl font-bold text-blue-600 mt-2">
                  {values.healthScore !== null
                    ? `${formatNumber(values.healthScore)}`
                    : "—"}
                </h3>
              </div>

              <div className="bg-white rounded-lg shadow p-5 text-center">
                <p className="text-gray-500 text-sm">Productivity</p>

                <h3 className="text-3xl font-bold text-purple-600 mt-2">
                  {values.productivity !== null
                    ? formatNumber(values.productivity)
                    : "—"}
                </h3>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h4 className="font-bold text-lg mb-4">
                Current Prediction Details
              </h4>

              <ul className="space-y-3 text-gray-700">
                <li>
                  • Risk Level: <strong>{riskLabel}</strong>
                </li>

                <li>
                  • Milk Drop Probability:{" "}
                  <strong>{formatPercent(values.dropProbability)}</strong>
                </li>

                <li>
                  • Stress Probability:{" "}
                  <strong>{formatPercent(values.stressProbability)}</strong>
                </li>

                <li>
                  • Milk Stability Index:{" "}
                  <strong>
                    {values.msi !== null ? formatNumber(values.msi) : "—"}
                  </strong>
                </li>

                <li>
                  • Priority:{" "}
                  <strong>
                    {values.priority ? getRiskLabel(values.priority) : "—"}
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          <Link
            href={`/herd/${encodeURIComponent(cow.cow_id)}/health`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-semibold transition"
          >
            🩺 Health
          </Link>

          <Link
            href={`/herd/${encodeURIComponent(cow.cow_id)}/history`}
            className="bg-orange-600 hover:bg-orange-700 text-white text-center py-4 rounded-xl font-semibold transition"
          >
            📜 History
          </Link>

          <Link
            href={`/herd/${encodeURIComponent(cow.cow_id)}/prediction`}
            className="bg-purple-600 hover:bg-purple-700 text-white text-center py-4 rounded-xl font-semibold transition"
          >
            🤖 Prediction
          </Link>

          <Link
            href={`/herd/${encodeURIComponent(cow.cow_id)}/reports`}
            className="bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl font-semibold transition"
          >
            📄 Reports
          </Link>

          <Link
            href={`/herd/${encodeURIComponent(cow.cow_id)}/twin`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-center py-4 rounded-xl font-semibold transition"
          >
            🐄 Digital Twin
          </Link>
        </div>
      </div>
    </main>
  );
}
