"use client";

import { CloudSun } from "lucide-react";

export default function WeatherCard() {
  return (
    <div className="rounded-2xl bg-green-700 p-5 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-green-100">Local Weather</p>

          <h2 className="mt-2 text-2xl font-bold">Weather data unavailable</h2>

          <p className="mt-1 text-sm text-green-100">
            Connect a live weather source to show current conditions and heat
            alerts.
          </p>
        </div>

        <CloudSun size={34} className="text-white" />
      </div>
    </div>
  );
}
