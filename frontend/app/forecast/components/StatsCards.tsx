"use client";

import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Brain,
} from "lucide-react";

const stats = [
  {
    title: "7-Day Trend",
    value: "+4.8%",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "Yield Variance",
    value: "±0.6 kg",
    icon: Activity,
    color: "text-blue-600",
  },
  {
    title: "Risk Score",
    value: "Low",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    title: "AI Confidence",
    value: "96%",
    icon: Brain,
    color: "text-purple-600",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {item.value}
                </h2>
              </div>

              <Icon className={item.color} size={34} />
            </div>
          </div>
        );
      })}
    </div>
  );
}