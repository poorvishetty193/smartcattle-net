"use client";

import { useEffect, useState } from "react";
import ForecastHeader from "./components/ForecastHeader";
import ForecastChart from "./components/ForecastChart";
import ScenarioSimulator from "./components/ScenarioSimulator";
import WeatherCard from "./components/WeatherCard";
import StatsCards from "./components/StatsCards";
import Footer from "./components/Footer";
import { apiPost } from "@/lib/api";

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
}

export default function ForecastPage() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrediction();
  }, []);

  async function loadPrediction() {
    try {
      setLoading(true);

      const data = await apiPost("/predict", {
        cow_id: "C04",

        lactation_number: 2,
        days_in_milk: 120,
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
        thi: 76,

        activity_level: 82,
        rumination: 510,
      });

      console.log("Forecast Page Prediction:", data);

      setPrediction(data);
    } catch (error) {
      console.error("Forecast Page Prediction Error:", error);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F8F4]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <ForecastHeader />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Forecast Chart */}
          <div className="lg:col-span-2">
            <ForecastChart prediction={prediction} loading={loading} />
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-4">
            <ScenarioSimulator />
            <WeatherCard />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6">
          <StatsCards prediction={prediction} loading={loading} />
        </div>

        <Footer />
      </div>
    </main>
  );
}
