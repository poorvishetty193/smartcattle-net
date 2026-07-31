"use client";

import ForecastHeader from "./components/ForecastHeader";
import ForecastChart from "./components/ForecastChart";
import ScenarioSimulator from "./components/ScenarioSimulator";
import WeatherCard from "./components/WeatherCard";
import StatsCards from "./components/StatsCards";
import Footer from "./components/Footer";

export default function ForecastPage() {
  return (
    <main className="min-h-screen bg-[#F5F8F4]">
      <div className="mx-auto max-w-7xl px-6 py-6">

        {/* Header */}
        <ForecastHeader />

        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left Side - Forecast Chart */}
          <div className="lg:col-span-2">
            <ForecastChart />
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-4">
            <ScenarioSimulator />
            <WeatherCard />
          </div>

        </div>

        {/* Bottom Stats */}
        <div className="mt-6">
          <StatsCards />
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </main>
  );
}