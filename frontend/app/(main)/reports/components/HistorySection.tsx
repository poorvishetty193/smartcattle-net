"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, AlertTriangle, Download, Loader2 } from "lucide-react";

import SearchBox from "./SearchBox";
import { apiGet } from "@/lib/api";

interface Report {
  name: string;
  timestamp: string;
  period: string;
  status: string;
  cow_id?: string;
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
    throw new Error("No data was available for this report.");
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

export default function HistorySection() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const data = await apiGet("/reports/history?limit=100");

      console.log("Report History:", data);

      if (Array.isArray(data)) {
        setReports(data);
      } else if (Array.isArray(data?.reports)) {
        setReports(data.reports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Report History Error:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const filteredReports = reports;

  const handleDownload = async (report: Report, index: number) => {
    if (!report.cow_id) {
      alert(
        "This history record does not contain a cow ID, so its prediction data cannot be downloaded.",
      );
      return;
    }

    try {
      setDownloadingIndex(index);

      /*
       * /reports/history intentionally returns report metadata.
       * The actual prediction values are stored behind
       * /predict/history. We retrieve the latest prediction
       * for the cow represented by this history entry.
       */
      const predictionData = await apiGet(
        `/predict/history?cow_id=${encodeURIComponent(
          report.cow_id,
        )}&skip=0&limit=50`,
      );

      if (!Array.isArray(predictionData) || predictionData.length === 0) {
        throw new Error(`No prediction data was found for ${report.cow_id}.`);
      }

      const latestPrediction = predictionData[0];

      downloadCsv(`${report.name.replace(/[^a-z0-9_-]/gi, "_")}.csv`, [
        {
          report_name: report.name,
          report_timestamp: report.timestamp,
          report_period: report.period,
          report_status: report.status,
          cow_id: report.cow_id,
          ...latestPrediction,
        },
      ]);
    } catch (error) {
      console.error("Report Download Error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to download report.",
      );
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-xl
        border
        border-[#BFD1C5]
        bg-white
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[#D5E0D9]
          px-6
          py-4
        "
      >
        <h2
          className="
            font-serif
            text-[17px]
            font-bold
            text-[#1C2923]
          "
        >
          Generation History
        </h2>

        <div className="w-[265px]">
          <SearchBox />
        </div>
      </div>

      {/* TABLE HEADER */}
      <div
        className="
          grid
          grid-cols-[2fr_1fr_1fr_0.8fr_0.7fr]
          bg-[#EAF1EC]
          px-6
          py-3
          font-serif
          text-[10px]
          font-bold
          uppercase
          tracking-wide
          text-[#53635A]
        "
      >
        <span>Report Name</span>
        <span>Timestamp</span>
        <span>Data Period</span>
        <span>Status</span>
        <span className="text-center">Download</span>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <div className="flex items-center gap-2 text-[#52645B]">
            <Loader2 size={18} className="animate-spin" />
            <p className="font-serif text-sm">Loading report history...</p>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <p className="font-serif text-sm text-[#52645B]">
            "No reports available."
          </p>
        </div>
      ) : (
        <>
          {/* ROWS */}
          {filteredReports.slice(0, 5).map((report, index) => {
            const critical = report.status.toLowerCase() === "critical";

            const archived = report.status.toLowerCase() === "archived";

            const legacy = report.status.toLowerCase() === "legacy";

            const downloading = downloadingIndex === index;

            return (
              <div
                key={`${report.name}-${report.timestamp}-${index}`}
                className="
                  grid
                  min-h-[72px]
                  grid-cols-[2fr_1fr_1fr_0.8fr_0.7fr]
                  items-center
                  border-b
                  border-[#D5E0D9]
                  px-6
                  py-3
                "
              >
                {/* REPORT */}
                <div className="flex items-center gap-3">
                  {critical ? (
                    <AlertTriangle size={20} className="text-red-600" />
                  ) : (
                    <FileText size={20} className="text-[#008060]" />
                  )}

                  <span
                    className="
                      font-serif
                      text-[14px]
                      text-[#1F2D26]
                    "
                  >
                    {report.name}
                  </span>
                </div>

                {/* TIMESTAMP */}
                <span
                  className="
                    font-serif
                    text-[11px]
                    text-[#56675E]
                  "
                >
                  {new Date(report.timestamp).toLocaleString()}
                </span>

                {/* PERIOD */}
                <span
                  className="
                    font-serif
                    text-[11px]
                    text-[#56675E]
                  "
                >
                  {report.period}
                </span>

                {/* STATUS */}
                <div>
                  <span
                    className={`
                      inline-flex
                      rounded-md
                      px-3
                      py-1
                      font-serif
                      text-[9px]
                      font-bold
                      uppercase
                      ${
                        critical
                          ? "bg-red-100 text-red-700"
                          : archived
                            ? "bg-[#D9F6E9] text-[#007B5C]"
                            : legacy
                              ? "bg-[#E8ECE9] text-[#59645E]"
                              : "bg-[#A9F2D1] text-[#006B4F]"
                      }
                    `}
                  >
                    {report.status}
                  </span>
                </div>

                {/* DOWNLOAD */}
                <button
                  type="button"
                  onClick={() => void handleDownload(report, index)}
                  disabled={downloading}
                  className="
                    mx-auto
                    text-[#007D5D]
                    transition
                    hover:text-[#004F3D]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  title={
                    report.cow_id
                      ? "Download report"
                      : "No cow data available for this report"
                  }
                >
                  {downloading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            );
          })}
        </>
      )}

      {/* FOOTER */}
      <div
        className="
          flex
          items-center
          justify-between
          bg-[#F4F8F5]
          px-6
          py-3
        "
      >
        <span
          className="
            font-serif
            text-[11px]
            text-[#52645B]
          "
        >
          Showing {Math.min(filteredReports.length, 5)} of{" "}
          {filteredReports.length} reports
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="
              rounded-md
              border
              border-[#BFCBC3]
              bg-white
              px-4
              py-1.5
              font-serif
              text-[10px]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Previous
          </button>

          <button
            type="button"
            disabled
            className="
              rounded-md
              border
              border-[#BFCBC3]
              bg-white
              px-4
              py-1.5
              font-serif
              text-[10px]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
