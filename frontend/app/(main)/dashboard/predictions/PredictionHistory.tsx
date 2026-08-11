"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Prediction {
  cow_id: string;
  stage1_daily_yield: number;
  stage11_health_score: number;
  stage12_risk_level: string;
}

interface PredictionHistoryProps {
  refreshKey?: number;
}

export default function PredictionHistory({
  refreshKey = 0,
}: PredictionHistoryProps) {
  const [history, setHistory] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [refreshKey]);

  async function fetchHistory() {
    try {
      setLoading(true);

      // IMPORTANT: no C04 here
      const data = await apiGet("/predict/history");

      console.log("Prediction History:", data);

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Prediction History Error:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border p-6">
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-xl font-bold mb-4">Prediction History</h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No prediction history available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Cow</th>
                <th className="text-left py-3">Daily Yield</th>
                <th className="text-left py-3">Health</th>
                <th className="text-left py-3">Risk</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 font-medium">{item.cow_id}</td>

                  <td>{Number(item.stage1_daily_yield).toFixed(2)} L</td>

                  <td>{Number(item.stage11_health_score).toFixed(2)}</td>

                  <td className="capitalize">{item.stage12_risk_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
