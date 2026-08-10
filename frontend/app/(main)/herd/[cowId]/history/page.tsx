"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function HistoryPage() {
  const historyData = [
    {
      date: "21-Jul-2026",
      morning: "14.2 L",
      evening: "14.0 L",
      total: "28.2 L",
      feed: "24 Kg",
      water: "68 L",
    },
    {
      date: "20-Jul-2026",
      morning: "13.9 L",
      evening: "14.1 L",
      total: "28.0 L",
      feed: "23 Kg",
      water: "66 L",
    },
    {
      date: "19-Jul-2026",
      morning: "13.7 L",
      evening: "13.8 L",
      total: "27.5 L",
      feed: "23 Kg",
      water: "65 L",
    },
    {
      date: "18-Jul-2026",
      morning: "13.5 L",
      evening: "13.6 L",
      total: "27.1 L",
      feed: "22 Kg",
      water: "64 L",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-8">

        <Link
          href="/herd/C-007"
          className="flex items-center gap-2 text-blue-600 font-semibold"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold">
          Milking History
        </h1>

      </div>

      <div className="bg-white rounded-xl shadow-md p-6">

        <div className="flex justify-between items-center mb-6">

          <input
            type="text"
            placeholder="Search Date..."
            className="border rounded-lg px-4 py-2 w-64"
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Filter
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b bg-gray-50">

                <th className="text-left py-4 px-2">Date</th>
                <th className="text-left py-4 px-2">Morning</th>
                <th className="text-left py-4 px-2">Evening</th>
                <th className="text-left py-4 px-2">Total Yield</th>
                <th className="text-left py-4 px-2">Feed Intake</th>
                <th className="text-left py-4 px-2">Water Intake</th>

              </tr>

            </thead>

            <tbody>

              {historyData.map((row, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="py-4 px-2">
                    {row.date}
                  </td>

                  <td className="px-2">
                    {row.morning}
                  </td>

                  <td className="px-2">
                    {row.evening}
                  </td>

                  <td className="px-2 font-bold text-green-600">
                    {row.total}
                  </td>

                  <td className="px-2">
                    {row.feed}
                  </td>

                  <td className="px-2">
                    {row.water}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        <div className="bg-white rounded-xl shadow-md p-6 text-center">

          <p className="text-gray-500">
            Average Milk Yield
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-3">
            28.1 L
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">

          <p className="text-gray-500">
            Average Feed Intake
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-3">
            23 Kg
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">

          <p className="text-gray-500">
            Average Water Intake
          </p>

          <h2 className="text-3xl font-bold text-cyan-600 mt-3">
            66 L
          </h2>

        </div>

      </div>

    </main>
  );
}