"use client";

import {
  Search,
  FileText,
  AlertTriangle,
  Download,
} from "lucide-react";

import SearchBox from "./SearchBox";

interface Report {
  name: string;
  timestamp: string;
  period: string;
  status: string;
}

interface HistorySectionProps {
  reports: Report[];
}

export default function HistorySection({
  reports,
}: HistorySectionProps) {

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


      {/* ROWS */}

      {reports.slice(0, 5).map((report, index) => {

        const critical =
          report.status.toLowerCase() === "critical";

        const archived =
          report.status.toLowerCase() === "archived";

        const legacy =
          report.status.toLowerCase() === "legacy";

        return (
          <div
            key={index}
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
                <AlertTriangle
                  size={20}
                  className="text-red-600"
                />
              ) : (
                <FileText
                  size={20}
                  className="text-[#008060]"
                />
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
              {report.timestamp}
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
          Showing 1-5 of 142 reports
        </span>


        <div className="flex gap-2">

          <button
            className="
              rounded-md
              border
              border-[#BFCBC3]
              bg-white
              px-4
              py-1.5
              font-serif
              text-[10px]
            "
          >
            Previous
          </button>

          <button
            className="
              rounded-md
              border
              border-[#BFCBC3]
              bg-white
              px-4
              py-1.5
              font-serif
              text-[10px]
            "
          >
            Next
          </button>

        </div>

      </div>

    </section>
  );
}