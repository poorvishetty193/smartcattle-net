"use client";

import { useState } from "react";

export default function PrivacyCard() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [liveHealthData, setLiveHealthData] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold uppercase tracking-wide text-gray-700">
        Privacy & Access
      </h3>

      <div className="space-y-6">
        {/* Public Profile */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Public Profile</span>

          <button
            onClick={() => setPublicProfile(!publicProfile)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              publicProfile ? "bg-green-700" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                publicProfile ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Live Health Data */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Live Health Data</span>

          <button
            onClick={() => setLiveHealthData(!liveHealthData)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              liveHealthData ? "bg-green-700" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                liveHealthData ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}