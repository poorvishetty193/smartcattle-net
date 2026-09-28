"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface Prediction {
  cow_id?: string;

  stage1_daily_yield?: number;

  stage6_forecast?: {
    s6_forecast_7d?: number[];
    s6_forecast_7d_mean?: number;
    s6_trend_slope?: number;
    s6_trend_direction?: number;
  };

  stage8_stress_probability?: number;
  stage12_risk_level?: string;

  input?: Record<string, unknown>;
}

interface ScenarioSimulatorProps {
  cowId: string;
  prediction: Prediction | null;
}

interface ScenarioResult {
  predictedDailyYield?: number;
  forecast7d?: number;
  trend?: string;
  riskLevel?: string;
  stressProbability?: number;
}

interface HistoryRecord {
  input?: Record<string, unknown>;
  raw_response?: unknown;

  stage6_forecast?: {
    s6_forecast_7d?: unknown;
    s6_forecast_7d_mean?: unknown;
    s6_trend_slope?: unknown;
    s6_trend_direction?: unknown;
  };

  stage1_daily_yield?: number;
  stage6_forecast_mean?: number;
  stage6_trend_slope?: number;
  stage6_trend_dir?: number;
  stage6_trend_direction?: number;

  stage8_stress_probability?: number;
  stage8_stress_prob?: number;
  stage12_risk_level?: string;
}

export default function ScenarioSimulator({
  cowId,
  prediction,
}: ScenarioSimulatorProps) {
  const [thi, setThi] = useState(72);
  const [daysInMilk, setDaysInMilk] = useState(154);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setResult(null);
    setMessage("");

    const input = prediction?.input;

    if (input) {
      const inputThi = Number(input.thi);
      const inputDim = Number(input.days_in_milk);

      if (Number.isFinite(inputThi)) {
        setThi(inputThi);
      }

      if (Number.isFinite(inputDim)) {
        setDaysInMilk(inputDim);
      }
    }
  }, [cowId, prediction]);

  function getTrend(direction?: number) {
    if (direction === 1) return "Increasing";
    if (direction === -1) return "Decreasing";
    if (direction === 0) return "Stable";

    return "Unavailable";
  }

 async function getOriginalInput(): Promise<Record<string, unknown> | null> {
   // 1. Use the input already available in the Forecast page.
   if (prediction?.input) {
     return prediction.input;
   }

   try {
     // 2. Get the latest saved prediction for this cow.
     const response = await apiGet(
       `/predict/history?cow_id=${encodeURIComponent(cowId)}&skip=0&limit=1`,
     );

     const history: HistoryRecord[] = Array.isArray(response)
       ? response
       : Array.isArray((response as { history?: HistoryRecord[] })?.history)
         ? ((response as { history: HistoryRecord[] }).history ?? [])
         : [];

     if (history.length === 0) {
       return null;
     }

     const latest = history[0] as HistoryRecord & Record<string, unknown>;

     // 3. First try the normal saved input.
     if (
       latest.input &&
       typeof latest.input === "object" &&
       !Array.isArray(latest.input)
     ) {
       return latest.input;
     }

     // 4. Try input inside raw_response.
     let source: Record<string, unknown> = latest;

     if (
       latest.raw_response &&
       typeof latest.raw_response === "object" &&
       !Array.isArray(latest.raw_response)
     ) {
       const raw = latest.raw_response as Record<string, unknown>;

       if (
         raw.input &&
         typeof raw.input === "object" &&
         !Array.isArray(raw.input)
       ) {
         return raw.input as Record<string, unknown>;
       }

       // The backend may have stored the original feature
       // values directly inside raw_response.
       source = raw;
     }

     /*
      * 5. IMPORTANT FIX
      *
      * Older predictions may not have:
      *
      *     raw_response.input
      *
      * but the original feature values are still saved
      * directly in the prediction record/raw_response.
      *
      * Rebuild PredictionRequest from those values.
      */

     const requiredFields = [
       "lactation_number",
       "days_in_milk",
       "parity",
       "milk_yield",
       "fat_percent",
       "protein_percent",
       "lactose_percent",
       "snf_percent",
       "scc",
       "body_temperature",
       "heart_rate",
       "respiration_rate",
       "feed_intake",
       "water_intake",
       "temperature",
       "humidity",
       "thi",
       "activity_level",
       "rumination",
     ];

     const hasAllFields = requiredFields.every(
       (field) =>
         source[field] !== undefined &&
         source[field] !== null &&
         source[field] !== "",
     );

     if (!hasAllFields) {
       console.warn(
         "Scenario Simulator: original feature values are incomplete.",
         source,
       );

       return null;
     }

     const numberValue = (field: string) => {
       const value = Number(source[field]);
       return Number.isFinite(value) ? value : null;
     };

     const numericFields = requiredFields.map(numberValue);

     if (numericFields.some((value) => value === null)) {
       console.warn(
         "Scenario Simulator: one or more saved feature values are invalid.",
         source,
       );

       return null;
     }

     // 6. Reconstruct the exact PredictionRequest structure.
     return {
       cow_id: cowId,

       lactation_number: Number(source.lactation_number),

       days_in_milk: Number(source.days_in_milk),

       parity: Number(source.parity),

       milk_yield: Number(source.milk_yield),

       fat_percent: Number(source.fat_percent),

       protein_percent: Number(source.protein_percent),

       lactose_percent: Number(source.lactose_percent),

       snf_percent: Number(source.snf_percent),

       scc: Number(source.scc),

       body_temperature: Number(source.body_temperature),

       heart_rate: Number(source.heart_rate),

       respiration_rate: Number(source.respiration_rate),

       feed_intake: Number(source.feed_intake),

       water_intake: Number(source.water_intake),

       temperature: Number(source.temperature),

       humidity: Number(source.humidity),

       thi: Number(source.thi),

       activity_level: Number(source.activity_level),

       rumination: Number(source.rumination),
     };
   } catch (error) {
     console.error("Failed to load original prediction input:", error);

     return null;
   }
 }

  async function runScenario() {
    if (!cowId) {
      return;
    }

    setMessage("");
    setResult(null);
    setRunning(true);

    try {
      /**
       * Get the original prediction input.
       */
      const originalInput = await getOriginalInput();

      /**
       * If the database record is an old prediction that never
       * stored its original input, we cannot safely invent the
       * missing cow measurements.
       *
       * Show an inline message instead of a browser alert.
       */
      if (!originalInput) {
        setMessage(
          "This cow's previous prediction does not contain the original input data. Run a new prediction for this cow once, then Scenario Simulator will work.",
        );

        return;
      }

      /**
       * Keep all original cow measurements and change only
       * the scenario variables.
       */
      const scenarioInput = {
        ...originalInput,
        cow_id: cowId,
        thi,
        days_in_milk: daysInMilk,
      };

      const response = (await apiPost("/predict", scenarioInput)) as Record<
        string,
        unknown
      >;

      const stage6 =
        response.stage6_forecast &&
        typeof response.stage6_forecast === "object" &&
        !Array.isArray(response.stage6_forecast)
          ? (response.stage6_forecast as Record<string, unknown>)
          : null;

      const forecastArray = Array.isArray(stage6?.s6_forecast_7d)
        ? (stage6.s6_forecast_7d as unknown[])
            .map(Number)
            .filter(Number.isFinite)
        : [];

      const forecastMean = Number(stage6?.s6_forecast_7d_mean);

      const direction = Number(stage6?.s6_trend_direction);

      const stressProbability = Number(response.stage8_stress_probability);

      const predictedDailyYield = Number(response.stage1_daily_yield);

      setResult({
        predictedDailyYield: Number.isFinite(predictedDailyYield)
          ? predictedDailyYield
          : undefined,

        forecast7d: Number.isFinite(forecastMean)
          ? forecastMean
          : forecastArray.length > 0
            ? forecastArray.reduce((sum, value) => sum + value, 0) /
              forecastArray.length
            : undefined,

        trend: getTrend(direction),

        riskLevel:
          typeof response.stage12_risk_level === "string"
            ? response.stage12_risk_level
            : undefined,

        stressProbability: Number.isFinite(stressProbability)
          ? stressProbability
          : undefined,
      });
    } catch (error) {
      console.error("Scenario prediction failed:", error);

      setResult(null);

      setMessage(
        "Unable to run the scenario. Please make sure this cow has a valid prediction.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Scenario Simulator</h2>

      <p className="mt-1 text-sm text-gray-500">
        Adjust environmental variables and run the AI prediction for{" "}
        {cowId || "the selected cow"}.
      </p>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Temperature-Humidity Index
          </label>

          <span className="font-semibold text-green-700">{thi}</span>
        </div>

        <input
          type="range"
          min="50"
          max="90"
          value={thi}
          onChange={(e) => setThi(Number(e.target.value))}
          className="mt-3 w-full accent-green-600"
        />
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Avg Days in Milk
          </label>

          <span className="font-semibold text-green-700">{daysInMilk}</span>
        </div>

        <input
          type="range"
          min="1"
          max="400"
          value={daysInMilk}
          onChange={(e) => setDaysInMilk(Number(e.target.value))}
          className="mt-3 w-full accent-green-600"
        />
      </div>

      <button
        onClick={runScenario}
        disabled={running || !cowId}
        className="mt-7 w-full rounded-xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {running ? "Running..." : "Run Scenario"}
      </button>

      {message && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {message}
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-xl bg-purple-50 p-5">
          <h3 className="font-semibold text-purple-700">AI Scenario Result</h3>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Predicted Daily Yield:</strong>{" "}
              {typeof result.predictedDailyYield === "number"
                ? `${result.predictedDailyYield.toFixed(2)} kg/day`
                : "Unavailable"}
            </p>

            <p>
              <strong>7-Day Forecast:</strong>{" "}
              {typeof result.forecast7d === "number"
                ? `${result.forecast7d.toFixed(2)} kg/day`
                : "Unavailable"}
            </p>

            <p>
              <strong>Trend:</strong> {result.trend ?? "Unavailable"}
            </p>

            <p>
              <strong>Risk Level:</strong> {result.riskLevel ?? "Unavailable"}
            </p>

            <p>
              <strong>Stress Probability:</strong>{" "}
              {typeof result.stressProbability === "number"
                ? `${(result.stressProbability * 100).toFixed(2)}%`
                : "Unavailable"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
