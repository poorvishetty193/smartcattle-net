"use client";

import ReportCard from "./components/ReportCard";
import DeliveryPanel from "./components/DeliveryPanel";
import HistorySection from "./components/HistorySection";
import FloatingButton from "./components/FloatingButton";

import { reportCards, deliveryOptions } from "./reportData";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-[#F5FAF6] px-7 py-6 text-[#17251F]">
      {/* ================= PAGE HEADING ================= */}

      <section className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-bold text-[#006B4F]">
            On-Demand Intelligence
          </h1>

          <p className="mt-1 font-serif text-[12px] text-[#52645B]">
            Generate high-fidelity reports instantly from live telemetry data.
          </p>
        </div>

        <p className="pt-2 text-[12px] font-semibold text-[#5147B8]">
          AI-Enhanced Analysis
        </p>
      </section>

      {/* ================= REPORT CARDS ================= */}

      <section className="grid grid-cols-3 gap-3">
        {reportCards.map((card, index) => (
          <ReportCard
            key={index}
            icon={card.icon}
            iconBg={card.iconBg}
            title={card.title}
            description={card.description}
            period={card.period}
            buttonText={card.buttonText}
            buttonColor={card.buttonColor}
          />
        ))}
      </section>

      {/* ================= BOTTOM SECTION ================= */}

      <section className="mt-7 grid grid-cols-[295px_1fr] gap-5 items-start">
        {/* LEFT */}

        <DeliveryPanel options={deliveryOptions} />

        {/* RIGHT */}

        <HistorySection />
      </section>

      {/* ================= FLOATING BUTTON ================= */}

      <FloatingButton />
    </main>
  );
}