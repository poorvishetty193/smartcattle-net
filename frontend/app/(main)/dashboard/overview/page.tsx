"use client";

import { useEffect, useState } from "react";
import { Thermometer, Radio, MapPin, Calendar } from "lucide-react";
import { apiGet } from "@/lib/api";

export default function Overview() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await apiGet("/dashboard/overview");

      console.log("Overview Response:", data);

      setOverview(data);
    } catch (error) {
      console.error("Overview Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        {/* Left Side */}
        <div>
          <h2 className="text-3xl font-bold text-green-700">Herd Overview</h2>

          <p className="mt-2 text-gray-500">{overview?.welcome_message}</p>

          <div className="flex flex-wrap gap-6 mt-5">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />

              <span className="text-gray-700">{overview?.farm_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-green-600" />

              <span className="text-gray-700">
                Last Sync{" "}
                {overview?.last_sync
                  ? new Date(overview.last_sync).toLocaleString()
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-green-100 px-5 py-3 rounded-full flex items-center gap-2">
            <Thermometer size={20} className="text-green-700" />

            <span className="font-semibold text-green-700">
              THI {overview?.thi}
            </span>
          </div>

          <div className="bg-red-50 px-5 py-3 rounded-full flex items-center gap-2">
            <Radio size={18} className="text-red-500" />

            <span className="font-semibold text-red-500">
              {overview?.status}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
