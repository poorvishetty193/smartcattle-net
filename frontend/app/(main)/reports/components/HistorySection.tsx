"use client";

import {
  FileText,
  AlertTriangle,
  Download,
} from "lucide-react";

import SearchBox from "./SearchBox";
import { historyItems } from "../reportData";

const statusStyles = {
  Completed: "bg-green-100 text-green-700",
  Archived: "bg-gray-100 text-gray-700",
  Critical: "bg-red-100 text-red-700",
  Legacy: "bg-yellow-100 text-yellow-700",
};

export default function HistorySection() {
  return (
    <div className="rounded-2xl border border-[#D9E5DB] bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#203040]">
            Generation History
          </h2>

          <p className="mt-1 text-[14px] text-gray-500">
            Recently generated intelligence reports
          </p>
        </div>

        <SearchBox />
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="pb-3 font-medium">Report</th>
              <th className="pb-3 font-medium">Generated</th>
              <th className="pb-3 font-medium">Period</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-center">Download</th>
            </tr>
          </thead>

          <tbody>

            {historyItems.map((item) => (

              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-none"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        item.type === "warning"
                          ? "bg-red-100"
                          : "bg-[#EEF6F0]"
                      }`}
                    >
                      {item.type === "warning" ? (
                        <AlertTriangle
                          size={18}
                          className="text-red-600"
                        />
                      ) : (
                        <FileText
                          size={18}
                          className="text-[#0C7A5B]"
                        />
                      )}
                    </div>

                    <span className="font-medium text-gray-800">
                      {item.reportName}
                    </span>

                  </div>
                </td>

                <td className="text-sm text-gray-600">
                  {item.timestamp}
                </td>

                <td className="text-sm text-gray-600">
                  {item.dataPeriod}
                </td>

                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[item.status]
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="text-center">
                  <button className="rounded-lg p-2 transition hover:bg-gray-100">
                    <Download
                      size={18}
                      className="text-[#0C7A5B]"
                    />
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>

    </div>
  );
}