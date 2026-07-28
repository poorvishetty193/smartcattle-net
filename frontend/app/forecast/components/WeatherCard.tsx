"use client";

import { CloudSun } from "lucide-react";

export default function WeatherCard() {
  return (
    <div className="rounded-2xl bg-green-700 p-4 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-green-100">Local Forecast</p>

          <h2 className="mt-2 text-2xl font-bold">
            Clear Skies • 22°C
          </h2>

          <p className="mt-1 text-sm text-green-100">
            Heatwave expected in D+3
          </p>
        </div>

        <CloudSun size={34} className="text-white" />
      </div>
    </div>
  );
}