"use client";

import Link from "next/link";
import {
  FaArrowLeft,
  FaHeartbeat,
  FaThermometerHalf,
  FaWalking,
  FaBrain,
  FaCheckCircle,
} from "react-icons/fa";

export default function HealthPage() {
  const healthCards = [
    {
      title: "Health Score",
      value: "96%",
      color: "bg-green-100 text-green-700",
      icon: <FaHeartbeat />,
    },
    {
      title: "Body Temperature",
      value: "38.5°C",
      color: "bg-red-100 text-red-700",
      icon: <FaThermometerHalf />,
    },
    {
      title: "Heart Rate",
      value: "72 bpm",
      color: "bg-pink-100 text-pink-700",
      icon: <FaHeartbeat />,
    },
    {
      title: "Rumination",
      value: "485 min",
      color: "bg-blue-100 text-blue-700",
      icon: <FaBrain />,
    },
    {
      title: "Activity",
      value: "Normal",
      color: "bg-yellow-100 text-yellow-700",
      icon: <FaWalking />,
    },
    {
      title: "Disease Risk",
      value: "Low",
      color: "bg-green-100 text-green-700",
      icon: <FaCheckCircle />,
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
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold">
          Cow Health Dashboard
        </h1>

      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {healthCards.map((card, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
          >

            <div className="flex justify-between items-center">

              <h2 className="text-gray-600 font-semibold">
                {card.title}
              </h2>

              <div className="text-2xl text-blue-600">
                {card.icon}
              </div>

            </div>

            <div
              className={`mt-6 p-4 rounded-lg text-center font-bold text-2xl ${card.color}`}
            >
              {card.value}
            </div>

          </div>

        ))}

      </div>

      {/* AI Health Recommendation */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">

        <h2 className="text-2xl font-bold mb-4">
          AI Health Recommendation
        </h2>

        <div className="bg-green-50 border border-green-300 rounded-lg p-5">

          <p className="text-lg text-gray-700">
            ✅ Cow is healthy with stable vital signs.
            Continue the current feeding schedule and monitor
            body temperature daily. No immediate veterinary
            attention is required.
          </p>

        </div>

      </div>

    </main>
  );
}