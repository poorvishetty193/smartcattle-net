"use client";

import { Thermometer, Radio } from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-40">
      <div>
        <h1 className="text-2xl font-bold text-green-700">Herd Overview</h1>

        <p className="text-sm text-gray-500">
          Satola Farm • 48 Cows • Last Sync 4 min ago
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="bg-green-100 px-4 py-2 rounded-full flex items-center gap-2">
          <Thermometer size={18} className="text-green-700" />

          <span className="text-sm font-semibold text-green-700">
            THI 68 • Comfortable
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Radio size={18} className="text-red-500" />

          <span className="text-sm font-semibold">Live</span>
        </div>
      </div>
    </header>
  );
}
