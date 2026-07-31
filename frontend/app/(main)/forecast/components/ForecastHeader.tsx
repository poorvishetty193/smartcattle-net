"use client";

import { CalendarDays, Download } from "lucide-react";

export default function ForecastHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Forecasts & Trends
        </h1>

        <p className="mt-1 text-gray-500">
          AI-powered milk yield forecasting
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm hover:bg-gray-50">
          <CalendarDays size={18} />
          <span>14 Days</span>
        </button>

        <button className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2 text-white hover:bg-green-800">
          <Download size={18} />
          Export PDF
        </button>
      </div>
    </div>
  );
}