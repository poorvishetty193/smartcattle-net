"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ScenarioResponse {
  stage1_daily_yield?: number;
  stage6_forecast?: {
    s6_forecast_7d_mean?: number;
    s6_trend_slope?: number;
    s6_trend_direction?: number;
  };
  stage7_productivity_score?: number;
  stage8_stress_probability?: number;
  stage12_risk_level?: string;
}

export default function ScenarioSimulator() {
  const [thi, setThi] = useState(72);
  const [daysInMilk, setDaysInMilk] = useState(154);

  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runScenario = async () => {
    try {
      setLoading(true);

      const data = await apiPost("/predict", {
        cow_id: "C04",
        lactation_number: 2,
        days_in_milk: daysInMilk,
        parity: 2,

        milk_yield: 28.5,
        fat_percent: 3.8,
        protein_percent: 3.3,
        lactose_percent: 4.8,
        snf_percent: 8.7,
        scc: 120000,

        body_temperature: 38.6,
        heart_rate: 68,
        respiration_rate: 28,

        feed_intake: 22.5,
        water_intake: 75,

        temperature: 29,
        humidity: 70,
        thi,

        activity_level: 82,
        rumination: 510,
      });

      console.log("Scenario Prediction:", data);

      setResult(data);
    } catch (error) {
      console.error("Scenario Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const forecastMean = result?.stage6_forecast?.s6_forecast_7d_mean;

  const trendDirection = result?.stage6_forecast?.s6_trend_direction;

  const riskLevel = result?.stage12_risk_level ?? "Unknown";

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Scenario Simulator
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Adjust environmental variables and run the AI prediction.
      </p>

      {/* THI */}
      <div className="mt-8">
        <div className="mb-2 flex justify-between">
          <span className="font-medium text-gray-700">
            Temperature-Humidity Index
          </span>

          <span className="font-semibold text-green-700">{thi}</span>
        </div>

        <input
          type="range"
          min="50"
          max="100"
          value={thi}
          onChange={(e) => setThi(Number(e.target.value))}
          className="w-full accent-green-700"
        />
      </div>

      {/* Days in Milk */}
      <div className="mt-8">
        <div className="mb-2 flex justify-between">
          <span className="font-medium text-gray-700">Avg Days in Milk</span>

          <span className="font-semibold text-green-700">{daysInMilk}</span>
        </div>

        <input
          type="range"
          min="1"
          max="365"
          value={daysInMilk}
          onChange={(e) => setDaysInMilk(Number(e.target.value))}
          className="w-full accent-green-700"
        />
      </div>

      {/* Run button */}
      <button
        onClick={runScenario}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Running AI Prediction...
          </>
        ) : (
          "Run Scenario"
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-xl bg-violet-100 p-5">
          <h3 className="font-semibold text-violet-700">AI Scenario Result</h3>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Predicted Daily Yield:</strong>{" "}
              {result.stage1_daily_yield?.toFixed(2)} kg/day
            </p>

            <p>
              <strong>7-Day Forecast:</strong> {forecastMean?.toFixed(2)} kg/day
            </p>

            <p>
              <strong>Trend:</strong>{" "}
              {trendDirection === 1
                ? "Increasing"
                : trendDirection === -1
                  ? "Decreasing"
                  : "Stable"}
            </p>

            <p>
              <strong>Risk Level:</strong>{" "}
              <span className="capitalize">{riskLevel}</span>
            </p>

            {result.stage8_stress_probability !== undefined && (
              <p>
                <strong>Stress Probability:</strong>{" "}
                {(result.stage8_stress_probability * 100).toFixed(2)}%
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
