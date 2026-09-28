"use client";

import { useEffect, useState } from "react";

import ForecastHeader from "./components/ForecastHeader";
import ForecastChart from "./components/ForecastChart";
import ScenarioSimulator from "./components/ScenarioSimulator";
import WeatherCard from "./components/WeatherCard";
import StatsCards from "./components/StatsCards";
import Footer from "./components/Footer";

import { apiGet } from "@/lib/api";

interface Cow {
  cow_id: string;
  breed?: string;
  is_active?: boolean;
}

interface CowsResponse {
  cows?: Cow[];
}

export interface PredictionResponse {
  cow_id?: string;

  stage1_daily_yield?: number;
  stage2_drop_probability?: number;
  stage3_next_milking?: number;
  stage4_msi?: number;
  stage5_quantity?: number;

  stage6_forecast?: {
    s6_forecast_7d?: number[];
    s6_forecast_7d_mean?: number;
    s6_trend_slope?: number;
    s6_trend_direction?: number;
  };

  stage7_productivity_score?: number;
  stage8_stress_probability?: number;
  stage9_recommendation?: string;
  stage10_priority_rank?: number;
  stage11_health_score?: number;
  stage12_risk_level?: string;

  /**
   * Original model input stored by the backend.
   * Used by Scenario Simulator.
   */
  input?: Record<string, unknown>;

  confidence?: number;
  ai_confidence?: number;
}

interface HistoryRecord {
  cow_id?: string;
  cow_label?: string;

  stage1_daily_yield?: number;

  stage2_drop_prob?: number;
  stage2_drop_probability?: number;

  stage3_next_milking?: number;
  stage4_msi?: number;
  stage5_quantity?: number;

  stage6_forecast_mean?: number;
  stage6_trend_slope?: number;
  stage6_trend_dir?: number;
  stage6_trend_direction?: number;

  stage7_productivity?: number;
  stage7_productivity_score?: number;

  stage8_stress_prob?: number;
  stage8_stress_probability?: number;

  stage9_recommendation?: string;
  stage10_priority_rank?: number;
  stage11_health_score?: number;
  stage12_risk_level?: string;

  raw_response?: unknown;

  /**
   * The backend currently returns the saved prediction
   * fields directly, including the original input.
   */
  input?: Record<string, unknown>;

  stage6_forecast?: {
    s6_forecast_7d?: unknown;
    s6_forecast_7d_mean?: unknown;
    s6_trend_slope?: unknown;
    s6_trend_direction?: unknown;
  };
}

function extractPredictionFromHistory(
  record: HistoryRecord,
): PredictionResponse {
  /**
   * IMPORTANT:
   *
   * /predict/history currently returns the contents of raw_response
   * directly. Therefore the prediction fields can exist directly
   * on `record`, not only inside `record.raw_response`.
   *
   * We support both structures:
   *
   * 1. record.raw_response -> old/nested structure
   * 2. record itself -> current backend structure
   */

  let raw: Record<string, unknown> = {};

  if (
    record.raw_response &&
    typeof record.raw_response === "object" &&
    !Array.isArray(record.raw_response)
  ) {
    raw = record.raw_response as Record<string, unknown>;
  } else {
    raw = record as unknown as Record<string, unknown>;
  }

  /**
   * Look for the actual model response inside raw_response.
   * Some older records may have nested prediction/result/response/output.
   */
  let modelResponse: Record<string, unknown> | null = null;

  const nestedCandidates = [
    raw.prediction,
    raw.result,
    raw.response,
    raw.output,
  ];

  for (const candidate of nestedCandidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      modelResponse = candidate as Record<string, unknown>;
      break;
    }
  }

  /**
   * If there is no nested response, raw itself is the prediction.
   *
   * This is the important fix for the current /predict/history response.
   */
  if (!modelResponse) {
    if (
      "stage1_daily_yield" in raw ||
      "stage6_forecast" in raw ||
      "stage11_health_score" in raw
    ) {
      modelResponse = raw;
    }
  }

  const source = modelResponse ?? {};

  /**
   * Stage 6 can be directly inside source.stage6_forecast.
   */
  const rawStage6 =
    source.stage6_forecast &&
    typeof source.stage6_forecast === "object" &&
    !Array.isArray(source.stage6_forecast)
      ? (source.stage6_forecast as Record<string, unknown>)
      : null;

  /**
   * Recover original model input.
   *
   * Current backend structure:
   * raw.input
   */
  const originalInput =
    raw.input && typeof raw.input === "object" && !Array.isArray(raw.input)
      ? (raw.input as Record<string, unknown>)
      : undefined;

  /**
   * Forecast array can come from:
   *
   * 1. stage6_forecast.s6_forecast_7d
   * 2. top-level s6_forecast_7d
   * 3. top-level forecast_7d
   */
  const rawForecastArray =
    rawStage6?.s6_forecast_7d ?? source.s6_forecast_7d ?? source.forecast_7d;

  const forecast7d = Array.isArray(rawForecastArray)
    ? rawForecastArray
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
    : undefined;

  const forecastMean = Number(
    rawStage6?.s6_forecast_7d_mean ??
      source.stage6_forecast_mean ??
      record.stage6_forecast_mean,
  );

  const trendSlope = Number(
    rawStage6?.s6_trend_slope ??
      source.stage6_trend_slope ??
      record.stage6_trend_slope,
  );

  const trendDirection = Number(
    rawStage6?.s6_trend_direction ??
      source.stage6_trend_direction ??
      source.s6_trend_dir ??
      record.stage6_trend_direction ??
      record.stage6_trend_dir,
  );

  return {
    cow_id: record.cow_id ?? record.cow_label,

    stage1_daily_yield: Number(
      source.stage1_daily_yield ?? record.stage1_daily_yield,
    ),

    stage2_drop_probability: Number(
      source.stage2_drop_probability ??
        record.stage2_drop_probability ??
        record.stage2_drop_prob,
    ),

    stage3_next_milking: Number(
      source.stage3_next_milking ?? record.stage3_next_milking,
    ),

    stage4_msi: Number(source.stage4_msi ?? record.stage4_msi),

    stage5_quantity: Number(source.stage5_quantity ?? record.stage5_quantity),

    stage6_forecast: {
      s6_forecast_7d: forecast7d,

      s6_forecast_7d_mean: Number.isFinite(forecastMean)
        ? forecastMean
        : undefined,

      s6_trend_slope: Number.isFinite(trendSlope) ? trendSlope : undefined,

      s6_trend_direction: Number.isFinite(trendDirection)
        ? trendDirection
        : undefined,
    },

    stage7_productivity_score: Number(
      source.stage7_productivity_score ??
        record.stage7_productivity_score ??
        record.stage7_productivity,
    ),

    stage8_stress_probability: Number(
      source.stage8_stress_probability ??
        record.stage8_stress_probability ??
        record.stage8_stress_prob,
    ),

    stage9_recommendation: String(
      source.stage9_recommendation ?? record.stage9_recommendation ?? "",
    ),

    stage10_priority_rank: Number(
      source.stage10_priority_rank ?? record.stage10_priority_rank,
    ),

    stage11_health_score: Number(
      source.stage11_health_score ?? record.stage11_health_score,
    ),

    stage12_risk_level: String(
      source.stage12_risk_level ?? record.stage12_risk_level ?? "",
    ),

    /**
     * This now correctly reaches ScenarioSimulator.
     */
    input: originalInput,

    confidence: Number(source.confidence ?? source.ai_confidence),

    ai_confidence: Number(source.ai_confidence ?? source.confidence),
  };
}

export default function ForecastPage() {
  const [cows, setCows] = useState<Cow[]>([]);
  const [selectedCowId, setSelectedCowId] = useState("");
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const [loadingCows, setLoadingCows] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    loadCows();
  }, []);

  async function loadCows() {
    try {
      setLoadingCows(true);

      const response = await apiGet("/cows");

      const allCows: Cow[] = Array.isArray(response)
        ? response
        : ((response as CowsResponse)?.cows ?? []);

      const activeCows = allCows.filter((cow) => cow.is_active !== false);

      setCows(activeCows);

      if (activeCows.length > 0) {
        setSelectedCowId(activeCows[0].cow_id);
      } else {
        setSelectedCowId("");
        setPrediction(null);
      }
    } catch (error) {
      console.error("Failed to load cows:", error);

      setCows([]);
      setSelectedCowId("");
      setPrediction(null);
    } finally {
      setLoadingCows(false);
    }
  }

  useEffect(() => {
    if (!selectedCowId) {
      setPrediction(null);
      return;
    }

    loadCowForecast(selectedCowId);
  }, [selectedCowId]);

  async function loadCowForecast(cowId: string) {
    try {
      setLoadingPrediction(true);
      setPrediction(null);

      const response = await apiGet(
        `/predict/history?cow_id=${encodeURIComponent(cowId)}&skip=0&limit=1`,
      );

      const history: HistoryRecord[] = Array.isArray(response)
        ? response
        : Array.isArray((response as { history?: HistoryRecord[] })?.history)
          ? ((response as { history: HistoryRecord[] }).history ?? [])
          : [];

      if (history.length === 0) {
        setPrediction(null);
        return;
      }

      const latestRecord = history[0];

      const formattedPrediction = extractPredictionFromHistory(latestRecord);

      setPrediction({
        ...formattedPrediction,
        cow_id: cowId,
      });
    } catch (error) {
      console.error(`Failed to load forecast for ${cowId}:`, error);

      setPrediction(null);
    } finally {
      setLoadingPrediction(false);
    }
  }

  const loading = loadingCows || loadingPrediction;

  return (
    <main className="min-h-screen bg-[#F5F8F4]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <ForecastHeader />

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cow Forecast</h2>

              <p className="text-sm text-gray-500">
                Select a registered cow to view its latest AI forecast.
              </p>
            </div>

            <select
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value)}
              disabled={loadingCows || cows.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:w-72"
            >
              {cows.length === 0 ? (
                <option value="">No active cows registered</option>
              ) : (
                cows.map((cow) => (
                  <option key={cow.cow_id} value={cow.cow_id}>
                    {cow.cow_id}
                    {cow.breed ? ` - ${cow.breed}` : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {cows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">No active cows</h2>

            <p className="mt-2 text-gray-500">
              Register a cow in Herd before viewing its forecast.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ForecastChart prediction={prediction} loading={loading} />
              </div>

              <div className="flex flex-col gap-4">
                <ScenarioSimulator
                  cowId={selectedCowId}
                  prediction={prediction}
                />

                <WeatherCard />
              </div>
            </div>

            <div className="mt-6">
              <StatsCards prediction={prediction} loading={loading} />
            </div>
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}
