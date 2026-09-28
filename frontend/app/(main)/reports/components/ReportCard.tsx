"use client";

import { useState } from "react";
import { LucideIcon, Loader2, Download } from "lucide-react";
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

function csvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    throw new Error("No report data was returned.");
  }

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  const csv = [
    columns.map(csvValue).join(","),
    ...rows.map((row) =>
      columns.map((column) => csvValue(row[column])).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
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

  const getFilename = () => {
    if (title === "Daily Herd Summary") {
      return "smartcattlenet_daily_herd_summary.csv";
    }

    if (title === "Weekly Vet Digest") {
      return "smartcattlenet_weekly_vet_digest.csv";
    }

    if (title === "Monthly Productivity") {
      return "smartcattlenet_monthly_productivity.csv";
    }

    return "smartcattlenet_report.csv";
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

      /*
       * The backend already returns the real report summary.
       * Convert that response into a downloadable CSV instead
       * of showing a temporary alert.
       */
      downloadCsv(getFilename(), [
        {
          report_name: title,
          period: data?.period ?? "",
          start_date: data?.start_date ?? "",
          end_date: data?.end_date ?? "",
          total_predictions: data?.total_predictions ?? "",
          cows: data?.cows ?? "",
          average_daily_yield: data?.average_daily_yield ?? "",
          average_health_score: data?.average_health_score ?? "",
          average_stress_probability: data?.average_stress_probability ?? "",
          average_productivity_score: data?.average_productivity_score ?? "",
          average_7_day_forecast: data?.average_7_day_forecast ?? "",
          increasing_trend_count: data?.increasing_trend_count ?? "",
          decreasing_trend_count: data?.decreasing_trend_count ?? "",
          stable_trend_count: data?.stable_trend_count ?? "",
          high_risk_count: data?.high_risk_count ?? "",
          medium_risk_count: data?.medium_risk_count ?? "",
          stress_alerts: data?.stress_alerts ?? "",
          attention_required: data?.attention_required ?? "",
        },
      ]);
    } catch (error) {
      console.error(`${title} Report Error:`, error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate report. Please try again.",
      );
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
        type="button"
        onClick={() => void handleGenerate()}
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
          <>
            <Download size={17} />
            {buttonText}
          </>
        )}
      </button>
    </div>
  );
}
