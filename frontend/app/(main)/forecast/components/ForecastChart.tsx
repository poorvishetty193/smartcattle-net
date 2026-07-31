"use client";

export default function ForecastChart() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Milk Yield Projection (kg/day)
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Historical performance vs AI-driven forecast
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-700"></div>
            Historical
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
            Predicted
          </div>

          <div className="flex items-center gap-2">
            <span>THI Overlay</span>

            <button className="relative h-6 w-11 rounded-full bg-green-600">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[420px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600">
            Chart Placeholder
          </h3>

          <p className="mt-2 text-gray-400">
            Recharts graph will be integrated here
          </p>
        </div>
      </div>
    </div>
  );
}