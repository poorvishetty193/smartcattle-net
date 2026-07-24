"use client";

import { Thermometer, Radio, MapPin, Calendar } from "lucide-react";

export default function Overview() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        {/* Left Side */}

        <div>
          <h2 className="text-3xl font-bold text-green-700">Herd Overview</h2>

          <p className="mt-2 text-gray-500">
            Welcome to SmartCattleNet Dashboard
          </p>

          <div className="flex flex-wrap gap-6 mt-5">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />

              <span className="text-gray-700">Satola Farm</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-green-600" />

              <span className="text-gray-700">Last Sync 4 min ago</span>
            </div>
          </div>
        </div>

        {/* Right Side */}

        <div className="flex flex-wrap items-center gap-4">
          {/* THI */}

          <div className="bg-green-100 px-5 py-3 rounded-full flex items-center gap-2">
            <Thermometer size={20} className="text-green-700" />

            <span className="font-semibold text-green-700">THI 68</span>
          </div>

          {/* Live */}

          <div className="bg-red-50 px-5 py-3 rounded-full flex items-center gap-2">
            <Radio size={18} className="text-red-500" />

            <span className="font-semibold text-red-500">Live</span>
          </div>
        </div>
      </div>
    </section>
  );
}
