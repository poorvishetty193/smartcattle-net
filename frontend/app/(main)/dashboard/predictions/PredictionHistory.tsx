"use client";

import { useEffect, useState } from "react";

interface Prediction {
  cow_id: string;
  stage1_daily_yield: number;
  stage11_health_score: number;
  stage12_risk_level: string;
}

export default function PredictionHistory() {
  const [history, setHistory] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/predict/history?cow_id=C04",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading history...</p>;

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-xl font-bold mb-4">Prediction History</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Cow</th>
            <th className="text-left py-2">Daily Yield</th>
            <th className="text-left py-2">Health</th>
            <th className="text-left py-2">Risk</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.cow_id}</td>
              <td>{item.stage1_daily_yield?.toFixed(2)}</td>
              <td>{item.stage11_health_score?.toFixed(2)}</td>
              <td>{item.stage12_risk_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
