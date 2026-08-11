"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type HeatmapCow = {
  cow_id: string;
  productivity_score: number;
};

type MilkYieldCow = {
  cow_id: string;
  daily_yield: number;
};

function getColor(score: number) {
  if (score >= 80) return "bg-green-600";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function Charts() {
  const [cows, setCows] = useState<HeatmapCow[]>([]);
  const [milkYields, setMilkYields] = useState<MilkYieldCow[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const [heatmapData, milkYieldData] = await Promise.all([
        apiGet("/dashboard/heatmap"),
        apiGet("/dashboard/milk-yield-trend"),
      ]);

      console.log("Heatmap Response:", heatmapData);
      console.log("Milk Yield Response:", milkYieldData);

      setCows(heatmapData?.heatmap || []);
      setMilkYields(milkYieldData?.trends || []);
    } catch (error) {
      console.error("Charts Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-gray-500">Loading charts...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HERD PRODUCTIVITY HEATMAP */}
      {/* ========================================================= */}

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Herd Productivity Heatmap
          </h2>

          <div className="flex flex-wrap gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600" />
              <span>80–100</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span>50–79</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>0–49</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {cows.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No heatmap data available.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {cows.map((cow, index) => (
                <div
                  key={`${cow.cow_id}-${index}`}
                  className={`${getColor(
                    cow.productivity_score,
                  )} rounded-xl text-white h-20 flex flex-col items-center justify-center shadow-sm hover:scale-105 transition-transform`}
                >
                  <span className="text-xs opacity-80">{cow.cow_id}</span>

                  <span className="text-lg font-bold">
                    {cow.productivity_score.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* MILK YIELD CHART */}
      {/* ========================================================= */}

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Milk Yield by Cow</h2>

          <p className="text-sm text-gray-500 mt-1">
            Latest predicted daily milk yield for each cow
          </p>
        </div>

        <div className="p-6">
          {milkYields.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No milk yield data available.
            </div>
          ) : (
            <div className="space-y-6">
              {milkYields.map((cow, index) => {
                const maxYield = Math.max(
                  ...milkYields.map((item) => item.daily_yield),
                  1,
                );

                const width = (cow.daily_yield / maxYield) * 100;

                return (
                  <div key={`${cow.cow_id}-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">
                        {cow.cow_id}
                      </span>

                      <span className="font-bold text-gray-800">
                        {cow.daily_yield.toFixed(2)} L
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-green-600 h-8 rounded-full flex items-center justify-end px-3 text-white text-sm font-semibold transition-all duration-500"
                        style={{
                          width: `${Math.max(width, 5)}%`,
                        }}
                      >
                        {cow.daily_yield.toFixed(2)} L
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
