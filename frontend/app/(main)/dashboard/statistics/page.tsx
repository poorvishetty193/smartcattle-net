"use client";

import {
  Droplets,
  TriangleAlert,
  HeartPulse,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

export default function Statistics() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Card 1 */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            Avg Daily Yield
          </span>

          <Droplets size={24} className="text-green-600" />
        </div>

        <div className="mt-5 flex items-end gap-2">
          <h2 className="text-4xl font-bold text-gray-800">28.4L</h2>

          <div className="flex items-center text-green-600 text-sm font-semibold">
            <TrendingUp size={16} />

            <span>+1.2%</span>
          </div>
        </div>
      </div>

      {/* Card 2 */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            At-Risk Cows
          </span>

          <TriangleAlert size={24} className="text-red-500" />
        </div>

        <div className="mt-5">
          <h2 className="text-4xl font-bold text-red-500">5</h2>

          <p className="mt-2 text-sm font-medium text-red-500">
            Requires Immediate Attention
          </p>
        </div>
      </div>

      {/* Card 3 */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            Avg Health Score
          </span>

          <HeartPulse size={24} className="text-blue-600" />
        </div>

        <div className="mt-5">
          <h2 className="text-4xl font-bold text-gray-800">74</h2>

          <p className="mt-2 text-sm text-gray-500">Out of 100</p>
        </div>
      </div>

      {/* Card 4 */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-gray-500">
            Stress Alerts
          </span>

          <BrainCircuit size={24} className="text-amber-500" />
        </div>

        <div className="mt-5">
          <h2 className="text-4xl font-bold text-amber-500">3</h2>

          <p className="mt-2 text-sm font-medium text-amber-500">Amber Alert</p>
        </div>
      </div>
    </section>
  );
}
