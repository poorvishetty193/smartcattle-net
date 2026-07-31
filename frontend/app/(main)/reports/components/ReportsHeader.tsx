"use client";

export default function ReportsHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[32px] font-bold text-[#0F2D52]">
          On-Demand Intelligence
        </h1>

        <p className="mt-2 text-[15px] text-gray-500">
          Generate high-fidelity reports instantly from live telemetry data.
        </p>
      </div>

      <div className="pt-2">
        <span className="text-[15px] font-semibold text-[#5B57C5]">
          AI-Enhanced Analysis
        </span>
      </div>
    </div>
  );
}