"use client";

import { RotateCw, Sparkles, Rocket } from "lucide-react";
import { ReportCard as ReportCardType } from "../types/report";

interface Props {
  card: ReportCardType;
}

export default function ReportCard({ card }: Props) {
  const Icon = card.icon;

  const buttonIcon = () => {
    switch (card.id) {
      case 1:
        return <RotateCw size={18} />;
      case 2:
        return <Sparkles size={18} />;
      default:
        return <Rocket size={18} />;
    }
  };

  return (
    <div className="rounded-2xl border border-[#D9E5DB] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">

      {/* Header */}

      <div className="mb-6 flex items-start justify-between">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg}`}
        >
          <Icon className="h-7 w-7 text-[#203040]" />
        </div>

        <span className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#444]">
          {card.period}
        </span>

      </div>

      {/* Title */}

      <h2 className="text-[18px] font-bold text-[#222]">
        {card.title}
      </h2>

      {/* Description */}

      <p className="mt-4 min-h-[78px] text-[14px] leading-6 text-[#555]">
        {card.description}
      </p>

      {/* Button */}

      <button
        className={`mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-[18px] font-semibold text-white transition hover:brightness-110 ${card.buttonColor}`}
      >
        {buttonIcon()}
        Generate
      </button>
    </div>
  );
}