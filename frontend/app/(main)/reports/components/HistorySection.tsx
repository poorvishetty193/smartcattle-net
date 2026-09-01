"use client";

import { useEffect, useState } from "react";
import { FileText, AlertTriangle, Download } from "lucide-react";

import SearchBox from "./SearchBox";
import { apiGet } from "@/lib/api";

interface Report {
  name: string;
  timestamp: string;
  period: string;
  status: string;
  cow_id?: string;
}

export default function HistorySection() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);

      const data = await apiGet("/reports/history");

      console.log("Report History:", data);

      setReports(data);
    } catch (error) {
      console.error("Report History Error:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

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

        <SearchBox />
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
          <p className="font-serif text-sm text-[#52645B]">
            Loading report history...
          </p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <p className="font-serif text-sm text-[#52645B]">
            No reports available.
          </p>
        </div>
      ) : (
        <>
          {/* ROWS */}

          {reports.slice(0, 5).map((report, index) => {
            const critical = report.status.toLowerCase() === "critical";

            const archived = report.status.toLowerCase() === "archived";

            const legacy = report.status.toLowerCase() === "legacy";

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
                  className="
                    mx-auto
                    text-[#007D5D]
                    transition
                    hover:text-[#004F3D]
                  "
                  title="Download"
                >
                  <Download size={18} />
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
          Showing {Math.min(reports.length, 5)} of {reports.length} reports
        </span>

        <div className="flex gap-2">
          <button
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
