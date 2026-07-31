"use client";

import ReportsHeader from "./components/ReportsHeader";
import ReportCard from "./components/ReportCard";
import DeliveryPanel from "./components/DeliveryPanel";
import HistorySection from "./components/HistorySection";
import FloatingButton from "./components/FloatingButton";

import { reportCards } from "./reportData";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAF7] p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <ReportsHeader />

        {/* Report Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {reportCards.map((card) => (
            <ReportCard key={card.id} card={card} />
          ))}
        </div>

        {/* Delivery Panel */}
        <div className="mt-8">
          <DeliveryPanel />
        </div>

        {/* History */}
        <div className="mt-8">
          <HistorySection />
        </div>

      </div>

      <FloatingButton />
    </main>
  );
}