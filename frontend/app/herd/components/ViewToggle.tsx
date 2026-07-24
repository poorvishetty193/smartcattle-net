"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";

export default function ViewToggle() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex items-center rounded-xl border border-gray-300 bg-gray-100 p-1">
      <button
        onClick={() => setView("grid")}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          view === "grid"
            ? "bg-white text-green-700 shadow"
            : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        <LayoutGrid size={16} />
        Grid
      </button>

      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          view === "list"
            ? "bg-white text-green-700 shadow"
            : "text-gray-600 hover:bg-gray-200"
        }`}
      >
        <List size={16} />
        List
      </button>
    </div>
  );
}