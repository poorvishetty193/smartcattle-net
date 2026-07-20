"use client";

import { Sparkles, ChevronRight } from "lucide-react";

const tasks = [
  {
    title: "Vet Intervention: Cow #05",
    priority: "URGENT",
    description:
      "Sharp drop in mobility detected. Early signs of mastitis. Quarantine recommended.",
    color: "border-red-500",
    badge: "bg-red-100 text-red-600",
  },
  {
    title: "Nutrient Adjustment: Sector B",
    priority: "MODERATE",
    description: "Increase fiber ratio by 5% to improve milk production.",
    color: "border-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    title: "Routine Gate Check",
    priority: "ROUTINE",
    description: "Sensor calibration scheduled for Sector D.",
    color: "border-green-500",
    badge: "bg-green-100 text-green-700",
  },
];

export default function Widgets() {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="text-purple-600" size={22} />

        <h2 className="text-xl font-bold">Today's Farm Decisions</h2>
      </div>

      {tasks.map((task) => (
        <div
          key={task.title}
          className={`bg-white rounded-2xl border-l-4 ${task.color} border border-gray-200 p-5 shadow-sm hover:shadow-lg transition`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold">{task.title}</h3>

            <span className={`text-xs px-3 py-1 rounded-full ${task.badge}`}>
              {task.priority}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-3">{task.description}</p>
        </div>
      ))}

      <button className="w-full bg-white border border-green-600 rounded-xl py-3 font-semibold text-green-700 hover:bg-green-600 hover:text-white transition flex justify-center items-center gap-2">
        View All Tasks
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
