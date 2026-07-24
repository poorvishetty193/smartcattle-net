"use client";

import { useState } from "react";

const filters = [
  "All",
  "At Risk",
  "Heat Stress",
  "Healthy",
  "Maternity",
];

export default function FilterBar() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;

        let activeStyle =
          "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100";

        if (filter === "All")
          activeStyle = "bg-green-700 text-white border-green-700";

        if (filter === "At Risk" && isActive)
          activeStyle = "bg-red-600 text-white border-red-600";

        if (filter === "Heat Stress" && isActive)
          activeStyle = "bg-yellow-500 text-white border-yellow-500";

        if (filter === "Healthy" && isActive)
          activeStyle = "bg-green-600 text-white border-green-600";

        if (filter === "Maternity" && isActive)
          activeStyle = "bg-blue-600 text-white border-blue-600";

        return (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              isActive
                ? activeStyle
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}