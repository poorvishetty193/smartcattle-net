"use client";

import Link from "next/link";

import {
  FaArrowLeft,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

export default function AlertsPage() {

  const alerts = [

    {
      id: 1,
      title: "High Mastitis Risk",
      severity: "Critical",
      time: "10 min ago",
      status: "Open",
      description:
        "Cow C-007 has a high probability of mastitis. Immediate inspection is recommended.",
      color: "bg-red-100 text-red-700",
    },

    {
      id: 2,
      title: "Low Feed Intake",
      severity: "Warning",
      time: "45 min ago",
      status: "Open",
      description:
        "Feed intake dropped below the normal threshold.",
      color: "bg-yellow-100 text-yellow-700",
    },

    {
      id: 3,
      title: "Body Temperature Normal",
      severity: "Resolved",
      time: "Today",
      status: "Closed",
      description:
        "Temperature returned to the healthy range.",
      color: "bg-green-100 text-green-700",
    },

  ];

  return (

    <main className="min-h-screen bg-gray-100 p-6">

    {/* Header */}

<div className="flex justify-between items-center mb-8">

  <Link
    href="/herd"
    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
  >
    <FaArrowLeft />
    Back to Herd
  </Link>

  <div className="flex items-center gap-2 text-red-600">

    <FaBell className="text-2xl" />

    <h1 className="text-3xl font-bold">
      Herd Alerts
    </h1>

  </div>

</div>

{/* Summary Cards */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">

    <FaExclamationTriangle className="text-red-500 text-3xl mb-4" />

    <p className="text-gray-500">
      Critical Alerts
    </p>

    <h2 className="text-4xl font-bold text-red-600">
      04
    </h2>

  </div>

  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">

    <FaBell className="text-yellow-500 text-3xl mb-4" />

    <p className="text-gray-500">
      Warnings
    </p>

    <h2 className="text-4xl font-bold text-yellow-600">
      07
    </h2>

  </div>

  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">

    <FaCheckCircle className="text-green-500 text-3xl mb-4" />

    <p className="text-gray-500">
      Resolved Today
    </p>

    <h2 className="text-4xl font-bold text-green-600">
      12
    </h2>

  </div>

</div>

{/* Search & Filter */}

<div className="bg-white rounded-xl shadow-md p-5 mb-8">

  <div className="flex flex-col md:flex-row gap-4">

    <div className="flex-1 relative">

      <FaSearch className="absolute left-4 top-4 text-gray-400" />

      <input
        type="text"
        placeholder="Search alerts..."
        className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>

    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">

      <FaFilter />

      Filter

    </button>

  </div>

</div>

{/* Alerts List */}

<div className="space-y-6">

  {alerts.map((alert) => (

    <div
      key={alert.id}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
    >

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-5">

        <div className="flex-1">

          <div className="flex items-center gap-3 mb-3">

            <FaBell className="text-red-500 text-xl" />

            <h2 className="text-xl font-bold">
              {alert.title}
            </h2>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${alert.color}`}
            >
              {alert.severity}
            </span>

          </div>

          <p className="text-gray-600 leading-7">
            {alert.description}
          </p>

          <div className="flex gap-8 mt-5 text-sm text-gray-500">

            <p>
              <b>Time:</b> {alert.time}
            </p>

            <p>
              <b>Status:</b> {alert.status}
            </p>

          </div>

        </div>

        <div className="flex flex-col gap-3">

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            View Details
          </button>

          <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
            Mark Resolved
          </button>

        </div>

      </div>

    </div>

  ))}

</div>

{/* Footer Summary */}

<div className="bg-white rounded-xl shadow-md p-6 mt-8">

  <h2 className="text-2xl font-bold mb-6">
    Alert Summary
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

    <div className="text-center">

      <h3 className="text-4xl font-bold text-red-600">
        04
      </h3>

      <p className="text-gray-500 mt-2">
        Critical
      </p>

    </div>

    <div className="text-center">

      <h3 className="text-4xl font-bold text-yellow-500">
        07
      </h3>

      <p className="text-gray-500 mt-2">
        Warning
      </p>

    </div>

    <div className="text-center">

      <h3 className="text-4xl font-bold text-green-600">
        12
      </h3>

      <p className="text-gray-500 mt-2">
        Resolved
      </p>

    </div>

    <div className="text-center">

      <h3 className="text-4xl font-bold text-blue-600">
        23
      </h3>

      <p className="text-gray-500 mt-2">
        Total Alerts
      </p>

    </div>

  </div>

</div>

</main>

);

}