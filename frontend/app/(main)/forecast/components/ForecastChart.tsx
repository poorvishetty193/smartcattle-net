"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ForecastChartProps {
  prediction: {
    stage6_forecast?: {
      s6_forecast_7d?: number[];
      s6_forecast_7d_mean?: number;
      s6_trend_slope?: number;
      s6_trend_direction?: number;
    };
  } | null;
  loading: boolean;
}

interface ChartData {
  day: string;
  forecast: number;
}

export default function ForecastChart({
  prediction,
  loading,
}: ForecastChartProps) {
  const forecast = prediction?.stage6_forecast?.s6_forecast_7d ?? [];

  const data: ChartData[] = forecast.map((value, index) => ({
    day: `Day ${index + 1}`,
    forecast: Number(value.toFixed(2)),
  }));

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Milk Yield Projection (kg/day)
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            AI-powered 7-day milk yield forecast
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          AI Forecast
        </div>
      </div>

      {loading ? (
        <div className="flex h-[420px] items-center justify-center">
          <p className="text-gray-500">Loading forecast...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[420px] items-center justify-center">
          <p className="text-gray-500">No forecast data available.</p>
        </div>
      ) : (
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis
                domain={["auto", "auto"]}
                label={{
                  value: "kg/day",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(2)} kg/day`,
                  "Forecast",
                ]}
              />

              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
