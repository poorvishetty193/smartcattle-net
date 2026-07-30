"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaArrowLeft,
  FaRobot,
  FaHeartbeat,
  FaThermometerHalf,
  FaTint,
  FaWeight,
  FaCloudSun,
  FaDownload,
} from "react-icons/fa";

export default function DigitalTwinPage() {

  const sensors = [
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
      title: "Weight",
      value: "620 Kg",
      color: "bg-indigo-100 text-indigo-700",
      icon: <FaWeight />,
    },
    {
      title: "Water Intake",
      value: "68 L",
      color: "bg-cyan-100 text-cyan-700",
      icon: <FaTint />,
    },
    {
      title: "Milk Yield",
      value: "28.5 L",
      color: "bg-green-100 text-green-700",
      icon: <FaRobot />,
    },
    {
      title: "Climate",
      value: "24°C",
      color: "bg-yellow-100 text-yellow-700",
      icon: <FaCloudSun />,
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
          Digital Twin
        </h1>

      </div>

      {/* Cow Profile */}

      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-8 items-center">

        <Image
          src="/cow.png"
          alt="Cow"
          width={220}
          height={220}
          className="rounded-xl border"
        />

        <div className="flex-1">

          <h2 className="text-3xl font-bold">
            Cow ID : C-007
          </h2>

          <p className="text-gray-500 mt-2">
            Holstein Friesian
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">

            <p><b>Age:</b> 5 Years</p>

            <p><b>Parity:</b> 3</p>

            <p><b>Weight:</b> 620 Kg</p>

            <p><b>Status:</b> Healthy</p>

            <p><b>Milk Yield:</b> 28.5 L/day</p>

            <p><b>Farm:</b> Smart Farm A</p>

          </div>

        </div>

      </div>

      {/* Live Sensors */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

        {sensors.map((sensor, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6"
          >

            <div className="flex justify-between">

              <h2 className="font-semibold text-gray-600">
                {sensor.title}
              </h2>

              <div className="text-blue-600 text-2xl">
                {sensor.icon}
              </div>

            </div>

            <div
              className={`mt-5 rounded-lg p-4 text-center text-2xl font-bold ${sensor.color}`}
            >
              {sensor.value}
            </div>

          </div>

        ))}

      </div>

      {/* AI Summary */}

      <div className="bg-white rounded-xl shadow-md p-6 mt-8">

        <h2 className="text-2xl font-bold mb-4">
          AI Digital Twin Summary
        </h2>

        <div className="bg-green-50 border border-green-300 rounded-lg p-5">

          <p className="text-lg text-gray-700">
            The Digital Twin indicates that Cow C-007 is in excellent health.
            Milk production is stable, feed conversion is optimal, and there
            are no signs of disease. Climate conditions remain favorable for
            the next few days.
          </p>

        </div>

      </div>

      {/* Actions */}

      <div className="flex flex-wrap gap-4 mt-8">

        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <FaRobot />
          Ask AI
        </button>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <FaDownload />
          Download Profile
        </button>

      </div>

    </main>
  );
}