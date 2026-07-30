"use client";

import Link from "next/link";
import {
  FaArrowLeft,
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaChartBar,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ReportsPage() {

  const reports = [
    {
      title: "Daily Report",
      description: "Today's milk production and health summary.",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Weekly Report",
      description: "Milk yield trends for the past 7 days.",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Monthly Report",
      description: "Monthly production and performance analysis.",
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Health Report",
      description: "Disease risk, vaccination and health records.",
      color: "bg-red-100 text-red-700",
    },
  ];

  return (

    <main className="min-h-screen bg-gray-100 p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <Link
          href="/herd/C-007"
          className="flex items-center gap-2 text-blue-600 font-semibold"
        >
          <FaArrowLeft />
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          Reports Dashboard
        </h1>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <FaChartBar className="text-4xl text-green-600 mx-auto mb-4"/>
          <p className="text-gray-500">Average Milk Yield</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            28.5 L
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <FaCalendarAlt className="text-4xl text-blue-600 mx-auto mb-4"/>
          <p className="text-gray-500">Reports Generated</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            36
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <FaFilePdf className="text-4xl text-red-600 mx-auto mb-4"/>
          <p className="text-gray-500">PDF Reports</p>
          <h2 className="text-3xl font-bold text-red-600 mt-2">
            18
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <FaFileExcel className="text-4xl text-emerald-600 mx-auto mb-4"/>
          <p className="text-gray-500">Excel Reports</p>
          <h2 className="text-3xl font-bold text-emerald-600 mt-2">
            18
          </h2>
        </div>

      </div>

      {/* Reports */}

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        {reports.map((report, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow p-6"
          >

            <h2 className={`text-xl font-bold ${report.color}`}>
              {report.title}
            </h2>

            <p className="text-gray-600 mt-3">
              {report.description}
            </p>

            <div className="flex gap-4 mt-6">

              <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                <FaFilePdf />
                PDF
              </button>

              <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                <FaFileExcel />
                Excel
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* Download */}

      <div className="bg-white rounded-xl shadow p-6 mt-8 text-center">

        <h2 className="text-2xl font-bold mb-4">
          Export Reports
        </h2>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-3 mx-auto">

          <FaDownload />

          Download Complete Report

        </button>

      </div>

    </main>

  );

}