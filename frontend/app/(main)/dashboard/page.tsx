"use client";

import Overview from "./overview/page";
import Statistics from "./statistics/page";
import Charts from "./charts/page";
import Widgets from "./widgets/page";
import Analytics from "./analytics/page";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <Overview />

      <Statistics />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <Charts />
        </div>

        <div className="xl:col-span-4">
          <Widgets />
        </div>
      </div>

      <Analytics />
    </div>
  );
}
