"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { HeartPulse, TriangleAlert, ShieldCheck } from "lucide-react";

interface HealthRiskItem {
  cow_id: string;
  health_score: number;
  risk_score: number;
  risk_level: string;
  risk_flag: number;
}

interface HealthRiskResponse {
  cows: HealthRiskItem[];
}

export default function HealthRisk() {
  const [data, setData] = useState<HealthRiskResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthRisk();
  }, []);

  const fetchHealthRisk = async () => {
    try {
      const response = await apiGet("/dashboard/health-risk");

      console.log("Health Risk Response:", response);

      setData(response);
    } catch (error) {
      console.error("Health Risk Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getRiskColor = (level: string) => {
    const risk = level.toLowerCase();

    if (risk === "high" || risk === "critical") {
      return "bg-red-100 text-red-700";
    }

    if (risk === "medium") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-green-100 text-green-700";
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-gray-500">Loading health and risk data...</p>
      </section>
    );
  }

  if (!data || data.cows.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-600" size={24} />

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Health & Risk Monitoring
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              No health or risk data available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <HeartPulse className="text-blue-600" size={24} />

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Health & Risk Monitoring
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest health and risk status for your herd
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Cow
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Health Score
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Risk Score
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Risk Level
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.cows.map((cow) => (
              <tr
                key={cow.cow_id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                {/* Cow */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-800">
                    {cow.cow_id}
                  </span>
                </td>

                {/* Health Score */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <HeartPulse
                      size={20}
                      className={getHealthColor(cow.health_score)}
                    />

                    <span
                      className={`font-bold ${getHealthColor(
                        cow.health_score,
                      )}`}
                    >
                      {cow.health_score.toFixed(2)}
                    </span>

                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </td>

                {/* Risk Score */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-700">
                    {cow.risk_score.toFixed(2)}
                  </span>
                </td>

                {/* Risk Level */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRiskColor(
                      cow.risk_level,
                    )}`}
                  >
                    {cow.risk_level}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {cow.risk_flag === 1 ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <TriangleAlert size={18} />

                      <span className="text-sm font-semibold">
                        Attention Required
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <ShieldCheck size={18} />

                      <span className="text-sm font-semibold">Normal</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
