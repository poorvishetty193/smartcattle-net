"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Sparkles, ChevronRight } from "lucide-react";

type Decision = {
  cow_id: string;
  recommendation: string;
};

export default function Widgets() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmDecisions();
  }, []);

  const fetchFarmDecisions = async () => {
    try {
      const data = await apiGet("/dashboard/farm-decisions");

      console.log("Farm Decisions Response:", data);

      setDecisions(data.decisions || []);
    } catch (error) {
      console.error("Farm Decisions Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p>Loading farm decisions...</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="text-purple-600" size={22} />
        <h2 className="text-xl font-bold">Today's Farm Decisions</h2>
      </div>

      {decisions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          No farm decisions available.
        </div>
      ) : (
        decisions.map((decision) => (
          <div
            key={decision.cow_id}
            className="bg-white rounded-2xl border-l-4 border-green-600 border border-gray-200 p-5 shadow-sm hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Cow ID: {decision.cow_id}</h3>

              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                Recommendation
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              {decision.recommendation}
            </p>
          </div>
        ))
      )}

      <button className="w-full bg-white border border-green-600 rounded-xl py-3 font-semibold text-green-700 hover:bg-green-600 hover:text-white transition flex justify-center items-center gap-2">
        View All Tasks
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
