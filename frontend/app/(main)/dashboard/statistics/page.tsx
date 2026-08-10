"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import {
  Droplets,
  TriangleAlert,
  HeartPulse,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

export default function Statistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await apiGet("/dashboard/statistics");

      console.log("Statistics Response:", data);

      setStats(data);
    } catch (error) {
      console.error("Statistics Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Avg Daily Yield */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            Avg Daily Yield
          </span>

          <Droplets size={24} className="text-green-600" />
        </div>

        <div className="mt-5 flex items-end gap-2">
          <h2 className="text-4xl font-bold text-gray-800">
            {stats?.avg_daily_yield}L
          </h2>

          <div className="flex items-center text-green-600 text-sm font-semibold">
            <TrendingUp size={16} />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* At Risk Cows */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            At-Risk Cows
          </span>

          <TriangleAlert size={24} className="text-red-500" />
        </div>

        <div className="mt-5">
          <h2 className="text-4xl font-bold text-red-500">
            {stats?.at_risk_cows}
          </h2>

          <p className="mt-2 text-sm font-medium text-red-500">
            Requires Immediate Attention
          </p>
        </div>
      </div>

      {/* Avg Health Score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            Avg Health Score
          </span>

          <HeartPulse size={24} className="text-blue-600" />
        </div>

        <div className="mt-5">
          <h2 className="text-4xl font-bold text-gray-800">
            {stats?.avg_health_score}
          </h2>

          <p className="mt-2 text-sm text-gray-500">Out of 100</p>
        </div>
      </div>

      {/* Stress Alerts */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            Stress Alerts
          </span>

          <BrainCircuit size={24} className="text-amber-500" />
        </div>

        <div className="mt-5">
          <h2 className="text-4xl font-bold text-amber-500">
            {stats?.stress_alerts}
          </h2>

          <p className="mt-2 text-sm font-medium text-amber-500">
            Active Alerts
          </p>
        </div>
      </div>
    </section>
  );
}
