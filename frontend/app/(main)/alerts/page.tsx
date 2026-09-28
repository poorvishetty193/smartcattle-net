"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { apiGet } from "@/lib/api";

interface BackendAlert {
  cow_id: string;
  alert_type: string;
  message: string;
  severity: string;
}

interface AlertItem {
  id: number;
  cow_id: string;
  title: string;
  severity: string;
  time: string;
  status: string;
  description: string;
  color: string;
}

interface AlertResponse {
  alerts: BackendAlert[];
}

interface Cow {
  cow_id: string;
  breed?: string;
  parity?: number;
  days_in_milk?: number;
  is_active?: boolean;
}

interface CowsResponse {
  cows?: Cow[];
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [alertsResponse, cowsResponse] = await Promise.all([
        apiGet("/alerts"),
        apiGet("/cows"),
      ]);

      const alertData = alertsResponse as AlertResponse;

      const formattedAlerts: AlertItem[] = (alertData?.alerts || []).map(
        (alert, index) => ({
          id: index + 1,
          cow_id: alert.cow_id,
          title: `${alert.alert_type} Alert - Cow ${alert.cow_id}`,
          severity: formatSeverity(alert.severity),
          time: "Today",
          status: "Open",
          description: alert.message,
          color: getSeverityColor(alert.severity),
        }),
      );

      setAlerts(formattedAlerts);

      const cowList: Cow[] = Array.isArray(cowsResponse)
        ? cowsResponse
        : ((cowsResponse as CowsResponse)?.cows ?? []);

      setCows(cowList.filter((cow) => cow.is_active !== false));
    } catch (error) {
      console.error("Alerts page error:", error);
      setAlerts([]);
      setCows([]);
    } finally {
      setLoading(false);
    }
  }

  function formatSeverity(severity: string) {
    const value = severity?.toLowerCase();

    if (value === "high" || value === "critical") {
      return "Critical";
    }

    if (value === "medium" || value === "warning") {
      return "Warning";
    }

    return "Resolved";
  }

  function getSeverityColor(severity: string) {
    const value = severity?.toLowerCase();

    if (value === "high" || value === "critical") {
      return "bg-red-100 text-red-700";
    }

    if (value === "medium" || value === "warning") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  }

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "Critical",
  ).length;

  const warningCount = alerts.filter(
    (alert) => alert.severity === "Warning",
  ).length;

  const resolvedCount = alerts.filter(
    (alert) => alert.severity === "Resolved",
  ).length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.description.toLowerCase().includes(search.toLowerCase()) ||
        alert.cow_id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || alert.severity === filter;

      return matchesSearch && matchesFilter;
    });
  }, [alerts, search, filter]);

  /*
   * Current farmer's active cows.
   * These are the only cows that can appear in Today's Tasks.
   */
  const activeCowIds = cows.map((cow) => cow.cow_id);

  /*
   * Use the first real alert as a real task instead of
   * displaying fake C-007/C-011/C-015 data.
   */
  const firstCriticalAlert = alerts.find(
    (alert) => alert.severity === "Critical",
  );

  const firstWarningAlert = alerts.find(
    (alert) => alert.severity === "Warning",
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 pt-24">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500">Loading alerts...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 pt-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/herd"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <FaArrowLeft />
          Back to Herd
        </Link>

        <div className="flex items-center gap-3">
          <FaBell className="text-red-600 text-3xl" />

          <h1 className="text-3xl font-bold">Herd Alerts</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Critical */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <FaExclamationTriangle className="text-red-500 text-3xl mb-4" />

          <p className="text-gray-500">Critical Alerts</p>

          <h2 className="text-4xl font-bold text-red-600">
            {criticalCount.toString().padStart(2, "0")}
          </h2>
        </div>

        {/* Warnings */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <FaBell className="text-yellow-500 text-3xl mb-4" />

          <p className="text-gray-500">Warnings</p>

          <h2 className="text-4xl font-bold text-yellow-600">
            {warningCount.toString().padStart(2, "0")}
          </h2>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <FaCheckCircle className="text-green-500 text-3xl mb-4" />

          <p className="text-gray-500">Resolved Today</p>

          <h2 className="text-4xl font-bold text-green-600">
            {resolvedCount.toString().padStart(2, "0")}
          </h2>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-lg"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <FaFilter />
              Filter
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 w-40">
                {["All", "Critical", "Warning", "Resolved"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilter(option);
                      setShowFilter(false);
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-6">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />

            <h2 className="text-xl font-bold text-gray-800">No alerts found</h2>

            <p className="text-gray-500 mt-2">
              There are currently no alerts matching your search.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FaBell className="text-red-500 text-xl" />

                    <h2 className="text-xl font-bold">{alert.title}</h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${alert.color}`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-7">{alert.description}</p>

                  <div className="flex gap-8 mt-5 text-sm text-gray-500">
                    <p>
                      <b>Cow:</b> {alert.cow_id}
                    </p>

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
          ))
        )}
      </div>

      {/* Calendar Header */}
      <div className="mt-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                🐄 SmartCattleNet
              </h1>

              <h2 className="text-3xl font-bold mt-6">Farm Schedule</h2>

              <p className="text-gray-500 mt-1">
                Precision Herd Management Schedule
              </p>
            </div>

            <div className="flex gap-4 mt-5 md:mt-0">
              <button className="border border-gray-300 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100">
                📄 Export
              </button>

              <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold">
                + New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar + Today's Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              No scheduled farm events yet.
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Use “+ New Event” to add a real farm reminder.
            </p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Today's Tasks</h2>

          {/* Real active herd task */}
          <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-4 mb-5">
            <h3 className="font-bold text-green-700">🥛 Morning Milking</h3>

            <p className="text-gray-600 mt-2">
              Complete morning milking for {activeCowIds.length} active{" "}
              {activeCowIds.length === 1 ? "cow" : "cows"}.
            </p>

            {activeCowIds.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Herd: {activeCowIds.join(", ")}
              </p>
            )}

            <p className="text-sm text-gray-500 mt-2">6:00 AM – 8:00 AM</p>
          </div>

          {/* Real warning task */}
          {firstWarningAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-5">
              <h3 className="font-bold text-yellow-700">
                ⚠️ Attention Required
              </h3>

              <p className="text-gray-600 mt-2">
                Cow {firstWarningAlert.cow_id} has an active warning:{" "}
                {firstWarningAlert.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">Today</p>
            </div>
          )}

          {/* Real critical task */}
          {firstCriticalAlert && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <h3 className="font-bold text-red-700">🚑 Immediate Attention</h3>

              <p className="text-gray-600 mt-2">
                Cow {firstCriticalAlert.cow_id}:{" "}
                {firstCriticalAlert.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">Immediate Attention</p>
            </div>
          )}

          {/* No alerts */}
          {!firstWarningAlert && !firstCriticalAlert && (
            <div className="bg-gray-50 border-l-4 border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-gray-700">
                ✅ No Additional Tasks
              </h3>

              <p className="text-gray-600 mt-2">
                There are no active health or risk tasks for your herd.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
