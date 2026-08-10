"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Ranking = {
  cow_id: string;
  priority_score: number;
  priority_rank: number;
};

export default function Analytics() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const data = await apiGet("/dashboard/priority-ranking");

      console.log("Priority Ranking Response:", data);

      setRankings(data.rankings || []);
    } catch (error) {
      console.error("Priority Ranking Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <p>Loading priority rankings...</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold">High Priority Attention Ranking</h2>
      </div>

      {rankings.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No priority ranking data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Cow ID</th>
                <th className="text-left p-4">Priority Score</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {rankings.map((cow) => (
                <tr key={cow.cow_id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-bold">#{cow.priority_rank}</td>

                  <td className="p-4 font-semibold">{cow.cow_id}</td>

                  <td className="p-4 text-red-600 font-bold">
                    {cow.priority_score}
                  </td>

                  <td className="p-4">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      High Priority
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
