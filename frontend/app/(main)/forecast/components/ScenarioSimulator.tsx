"use client";

export default function ScenarioSimulator() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Scenario Simulator
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Adjust environmental variables to estimate milk yield.
      </p>

      {/* THI Slider */}
      <div className="mt-8">
        <div className="mb-2 flex justify-between">
          <span className="font-medium text-gray-700">
            Temperature-Humidity Index
          </span>

          <span className="font-semibold text-green-700">
            72.4
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="100"
          defaultValue={72}
          className="w-full accent-green-700"
        />
      </div>

      {/* DIM Slider */}
      <div className="mt-8">
        <div className="mb-2 flex justify-between">
          <span className="font-medium text-gray-700">
            Avg Days in Milk
          </span>

          <span className="font-semibold text-green-700">
            154
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="365"
          defaultValue={154}
          className="w-full accent-green-700"
        />
      </div>

      {/* Result Card */}
      <div className="mt-8 rounded-xl bg-violet-100 p-5">
        <h3 className="font-semibold text-violet-700">
          Projected Impact
        </h3>

        <p className="mt-2 text-sm text-gray-700">
          A 5% increase in THI may reduce milk production over the next
          48 hours.
        </p>
      </div>
    </div>
  );
}