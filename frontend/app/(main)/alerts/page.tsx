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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data: AlertResponse = await apiGet("/dashboard/alerts");

      console.log("Alerts Response:", data);

      const formattedAlerts: AlertItem[] = (data?.alerts || []).map(
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
    } catch (error) {
      console.error("Alerts Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSeverity = (severity: string) => {
    const value = severity?.toLowerCase();

    if (value === "high" || value === "critical") {
      return "Critical";
    }

    if (value === "medium" || value === "warning") {
      return "Warning";
    }

    return "Resolved";
  };

  const getSeverityColor = (severity: string) => {
    const value = severity?.toLowerCase();

    if (value === "high" || value === "critical") {
      return "bg-red-100 text-red-700";
    }

    if (value === "medium" || value === "warning") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

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
      {" "}
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
      {/* Calendar Dashboard */}
      <div className="mt-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                🐄 SmartCattleNet
              </h1>

              <h2 className="text-3xl font-bold mt-6">July 2026</h2>

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
          <div className="grid grid-cols-7 text-center font-bold text-gray-600 border-b pb-3">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          <div className="grid grid-cols-7">
            {[
              "",
              "",
              "",
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              "",
            ].map((day, index) => (
              <div
                key={index}
                className="h-28 border border-gray-200 p-2 hover:bg-green-50"
              >
                {day !== "" && (
                  <>
                    <div className="font-semibold">{day}</div>

                    <div className="flex gap-1 mt-2">
                      {day === 3 && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        </>
                      )}

                      {day === 7 && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}

                      {day === 10 && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}

                      {day === 15 && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}

                      {day === 17 && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        </>
                      )}

                      {day === 20 && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}

                      {day === 23 && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}

                      {day === 27 && (
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Today's Tasks</h2>

          <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-4 mb-5">
            <h3 className="font-bold text-green-700">🥛 Morning Milking</h3>

            <p className="text-gray-600 mt-2">
              Complete morning milking for all lactating cows.
            </p>

            <p className="text-sm text-gray-500 mt-2">6:00 AM – 8:00 AM</p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-5">
            <h3 className="font-bold text-yellow-700">💉 Vaccination</h3>

            <p className="text-gray-600 mt-2">
              Vaccinate Cow C-007 and Cow C-011.
            </p>

            <p className="text-sm text-gray-500 mt-2">10:30 AM</p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <h3 className="font-bold text-red-700">🚑 Emergency Vet Check</h3>

            <p className="text-gray-600 mt-2">
              High temperature detected in Cow C-015.
            </p>

            <p className="text-sm text-gray-500 mt-2">Immediate Attention</p>
          </div>
        </div>
      </div>
    </main>
  );
}
