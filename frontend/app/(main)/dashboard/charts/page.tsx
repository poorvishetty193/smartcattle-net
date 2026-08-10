"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type HeatmapCow = {
  cow_id: string;
  productivity_score: number;
};

function getColor(score: number) {
  if (score >= 80) return "bg-green-600";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function Charts() {
  const [cows, setCows] = useState<HeatmapCow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    try {
      const data = await apiGet("/dashboard/heatmap");

      console.log("Heatmap Response:", data);

      setCows(data.heatmap || []);
    } catch (error) {
      console.error("Heatmap Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p>Loading heatmap...</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          Herd Productivity Heatmap
        </h2>

        <div className="flex gap-5 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span>80–100</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500"></div>
            <span>50–79</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
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
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {cows.map((cow) => (
              <div
                key={cow.cow_id}
                className={`${getColor(
                  cow.productivity_score,
                )} rounded-xl text-white h-20 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm`}
              >
                <span className="text-xs opacity-80">{cow.cow_id}</span>

                <span className="text-lg font-bold">
                  {cow.productivity_score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
