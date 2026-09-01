"use client";

import { useState } from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface ReportCardProps {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
  period: string;
  buttonText: string;
  buttonColor: string;
}

export default function ReportCard({
  icon: Icon,
  iconBg,
  title,
  description,
  period,
  buttonText,
  buttonColor,
}: ReportCardProps) {
  const [loading, setLoading] = useState(false);

  const getEndpoint = () => {
    if (period.includes("24H")) {
      return "/reports/summary/daily";
    }

    if (period.includes("7D")) {
      return "/reports/summary/weekly";
    }

    if (period.includes("30D")) {
      return "/reports/summary/monthly";
    }

    return null;
  };

  const handleGenerate = async () => {
    const endpoint = getEndpoint();

    if (!endpoint) {
      console.error("Unknown report period:", period);
      return;
    }

    try {
      setLoading(true);

      const data = await apiGet(endpoint);

      console.log(`${title} Report:`, data);

      alert(
        `${title}\n\n` +
          `Predictions: ${data.total_predictions ?? 0}\n` +
          `Cows: ${data.cows ?? 0}\n` +
          `Average Daily Yield: ${data.average_daily_yield ?? 0}`,
      );
    } catch (error) {
      console.error(`${title} Report Error:`, error);

      alert("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-[267px]
        rounded-xl
        border
        border-[#C9D8CE]
        bg-white
        p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
      "
    >
      {/* TOP */}

      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-12 w-12
            items-center justify-center
            rounded-lg
            ${iconBg}
          `}
        >
          <Icon className="h-5 w-5 text-[#17352A]" />
        </div>

        <span
          className="
            pt-1
            font-serif
            text-[11px]
            font-bold
            tracking-wide
            text-[#34443C]
          "
        >
          {period}
        </span>
      </div>

      {/* CONTENT */}

      <div className="mt-5">
        <h2
          className="
            font-serif
            text-[16px]
            font-bold
            text-[#17251F]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            max-w-[390px]
            font-serif
            text-[12px]
            leading-[1.55]
            text-[#52645B]
          "
        >
          {description}
        </p>
      </div>

      {/* BUTTON */}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`
          mt-6
          flex
          h-[43px]
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          font-serif
          text-[15px]
          font-semibold
          text-white
          transition
          hover:brightness-95
          disabled:cursor-not-allowed
          disabled:opacity-60
          ${buttonColor}
        `}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
}
