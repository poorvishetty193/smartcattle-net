"use client";

import Link from "next/link";
import {
  FaArrowLeft,
  FaRobot,
  FaHeartbeat,
  FaExclamationTriangle,
  FaTint,
  FaChartBar,
} from "react-icons/fa";

export default function PredictionPage() {

  const cards = [
    {
      title: "Milk Yield Prediction",
      value: "29.4 L",
      color: "bg-green-100 text-green-700",
      icon: <FaChartBar />,
    },
    {
      title: "Disease Risk",
      value: "Low",
      color: "bg-red-100 text-red-700",
      icon: <FaHeartbeat />,
    },
    {
      title: "Heat Stress",
      value: "Normal",
      color: "bg-orange-100 text-orange-700",
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Water Intake",
      value: "70 L",
      color: "bg-cyan-100 text-cyan-700",
      icon: <FaTint />,
    },
    {
      title: "AI Confidence",
      value: "97%",
      color: "bg-blue-100 text-blue-700",
      icon: <FaRobot />,
    },
    {
      title: "Overall Status",
      value: "Healthy",
      color: "bg-lime-100 text-lime-700",
      icon: <FaHeartbeat />,
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
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          AI Prediction Dashboard
        </h1>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {cards.map((card,index)=>(

          <div
            key={index}
            className="bg-white rounded-xl shadow p-6"
          >

            <div className="flex justify-between">

              <h2 className="text-gray-500">
                {card.title}
              </h2>

              <div className="text-blue-600 text-xl">
                {card.icon}
              </div>

            </div>

            <div
              className={`mt-5 p-4 rounded-lg text-center text-2xl font-bold ${card.color}`}
            >
              {card.value}
            </div>

          </div>

        ))}

      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <h2 className="text-2xl font-bold mb-4">
          AI Recommendation
        </h2>

        <div className="bg-green-50 border border-green-300 rounded-lg p-5">

          <p className="text-gray-700 text-lg">
            AI predicts stable milk production with a low probability of disease.
            Maintain the current feeding schedule and continue monitoring health
            indicators for optimal productivity.
          </p>

        </div>

      </div>

    </main>

  );
}