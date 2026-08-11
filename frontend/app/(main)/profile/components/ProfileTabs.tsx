"use client";

import { useState } from "react";

const tabs = ["My Cows", "Farm Stats", "Activity", "Settings"];

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("My Cows");

  return (
    <div className="border-b border-gray-300">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
              activeTab === tab
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}