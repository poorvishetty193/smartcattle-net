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
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { apiGet } from "@/lib/api";

interface BackendAlert {
  cow_id: string;
  alert_type: string;
  message: string;
  severity: string;
}

interface AlertItem {
  id: string;
  cow_id: string;
  alert_type: string;
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

interface AlertDetail {
  cow_id: string;
  alert_type: string;
  severity: string;
  reason: string;
  evidence: string[];
  recommendation: string;
  prediction_time?: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("All");

  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const [alertDetail, setAlertDetail] = useState<AlertDetail | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [detailError, setDetailError] = useState("");

  const [resolvedKeys, setResolvedKeys] = useState<string[]>([]);

  // -------------------------------------------------------------------------
  // Load resolved alerts from browser storage
  // -------------------------------------------------------------------------

  useEffect(() => {
    try {
      const stored = localStorage.getItem("smartcattlenet_resolved_alerts");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setResolvedKeys(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load resolved alerts:", error);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Load alerts + active cows
  // -------------------------------------------------------------------------

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

      // ---------------------------------------------------------------------
      // Alerts
      // ---------------------------------------------------------------------

      const alertData = alertsResponse as AlertResponse;

      const storedResolvedKeys = getStoredResolvedKeys();

      const formattedAlerts: AlertItem[] = (alertData?.alerts || []).map(
        (alert) => {
          const id = `${alert.cow_id}-${alert.alert_type}`;

          const isResolved = storedResolvedKeys.includes(id);

          return {
            id,
            cow_id: alert.cow_id,
            alert_type: alert.alert_type,
            title: `${alert.alert_type} Alert - Cow ${alert.cow_id}`,
            severity: isResolved ? "Resolved" : formatSeverity(alert.severity),
            time: "Today",
            status: isResolved ? "Resolved" : "Open",
            description: alert.message,
            color: isResolved
              ? "bg-green-100 text-green-700"
              : getSeverityColor(alert.severity),
          };
        },
      );

      setAlerts(formattedAlerts);

      // ---------------------------------------------------------------------
      // Active cows
      // ---------------------------------------------------------------------

      const cowList: Cow[] = Array.isArray(cowsResponse)
        ? cowsResponse
        : ((cowsResponse as CowsResponse)?.cows ?? []);

      const activeCows = cowList.filter((cow) => cow.is_active !== false);

      setCows(activeCows);
    } catch (error) {
      console.error("Alerts page error:", error);

      setAlerts([]);
      setCows([]);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Local resolved-alert storage
  // -------------------------------------------------------------------------

  function getStoredResolvedKeys(): string[] {
    try {
      const stored = localStorage.getItem("smartcattlenet_resolved_alerts");

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveResolvedKeys(keys: string[]) {
    try {
      localStorage.setItem(
        "smartcattlenet_resolved_alerts",
        JSON.stringify(keys),
      );
    } catch (error) {
      console.error("Failed to save resolved alert:", error);
    }
  }

  // -------------------------------------------------------------------------
  // View Details
  // -------------------------------------------------------------------------

  async function handleViewDetails(alert: AlertItem) {
    setSelectedAlert(alert);
    setAlertDetail(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const endpoint = `/alerts/${encodeURIComponent(
        alert.cow_id,
      )}/${encodeURIComponent(alert.alert_type)}`;

      const response = await apiGet(endpoint);

      setAlertDetail(response as AlertDetail);
    } catch (error) {
      console.error("Failed to load alert details:", error);

      setDetailError("Unable to load the prediction evidence for this alert.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetails() {
    setSelectedAlert(null);
    setAlertDetail(null);
    setDetailError("");
    setDetailLoading(false);
  }

  // -------------------------------------------------------------------------
  // Mark Resolved
  // -------------------------------------------------------------------------

  function handleMarkResolved(alertId: string) {
    const currentKeys = getStoredResolvedKeys();

    if (!currentKeys.includes(alertId)) {
      currentKeys.push(alertId);
    }

    saveResolvedKeys(currentKeys);
    setResolvedKeys(currentKeys);

    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "Resolved",
              severity: "Resolved",
              color: "bg-green-100 text-green-700",
            }
          : alert,
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Severity helpers
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Summary counts
  // -------------------------------------------------------------------------

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "Critical",
  ).length;

  const warningCount = alerts.filter(
    (alert) => alert.severity === "Warning",
  ).length;

  const resolvedCount = alerts.filter(
    (alert) => alert.status === "Resolved",
  ).length;

  // -------------------------------------------------------------------------
  // Search + filter
  // -------------------------------------------------------------------------

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        alert.title.toLowerCase().includes(searchValue) ||
        alert.description.toLowerCase().includes(searchValue) ||
        alert.cow_id.toLowerCase().includes(searchValue);

      const matchesFilter = filter === "All" || alert.severity === filter;

      return matchesSearch && matchesFilter;
    });
  }, [alerts, search, filter]);

  // -------------------------------------------------------------------------
  // Active farmer's cows
  // -------------------------------------------------------------------------

  const activeCowIds = cows.map((cow) => cow.cow_id);

  const firstCriticalAlert = alerts.find(
    (alert) => alert.severity === "Critical",
  );

  const firstWarningAlert = alerts.find(
    (alert) => alert.severity === "Warning",
  );

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 pt-24">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500">Loading alerts...</p>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Page
  // -------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-6 pt-24">
      {/* ================================================================
          HEADER
      ================================================================= */}

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

      {/* ================================================================
          SUMMARY CARDS
      ================================================================= */}

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

          <p className="text-gray-500">Resolved</p>

          <h2 className="text-4xl font-bold text-green-600">
            {resolvedCount.toString().padStart(2, "0")}
          </h2>
        </div>
      </div>

      {/* ================================================================
          SEARCH + FILTER
      ================================================================= */}

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
              type="button"
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
                    type="button"
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

      {/* ================================================================
          ALERT LIST
      ================================================================= */}

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
                {/* Alert information */}

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

                  <div className="flex flex-wrap gap-8 mt-5 text-sm text-gray-500">
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

                {/* Actions */}

                <div className="flex flex-col gap-3 min-w-[170px]">
                  {/* ----------------------------------------------------
                        VIEW DETAILS
                    ----------------------------------------------------- */}

                  <button
                    type="button"
                    onClick={() => handleViewDetails(alert)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-center"
                  >
                    View Details
                  </button>

                  {/* ----------------------------------------------------
                        MARK RESOLVED
                    ----------------------------------------------------- */}

                  {alert.status === "Resolved" ? (
                    <button
                      type="button"
                      disabled
                      className="bg-gray-200 text-gray-500 px-5 py-2 rounded-lg cursor-not-allowed"
                    >
                      Resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(alert.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================================================================
          TODAY'S TASKS
      ================================================================= */}

      <div className="mt-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-green-700">
            🐄 SmartCattleNet
          </h1>

          <h2 className="text-3xl font-bold mt-6">Farm Schedule</h2>

          <p className="text-gray-500 mt-1">
            Precision Herd Management Schedule
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        {/* Calendar */}

        <div className="xl:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              No scheduled farm events yet.
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Use the farm event system to add a real reminder.
            </p>
          </div>
        </div>

        {/* Today's Tasks */}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Today&apos;s Tasks</h2>

          {/* Morning Milking */}

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

          {/* Warning Task */}

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

          {/* Critical Task */}

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

      {/* ================================================================
          ALERT DETAILS MODAL
      ================================================================= */}

      {selectedAlert && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={closeDetails}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-sm text-gray-500">Alert Details</p>

                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAlert.alert_type} Alert — Cow {selectedAlert.cow_id}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal body */}

            <div className="p-6">
              {detailLoading && (
                <div className="py-12 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                  <p className="mt-4 text-gray-500">
                    Loading actual prediction evidence...
                  </p>
                </div>
              )}

              {!detailLoading && detailError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-5">
                  <div className="flex items-center gap-3 text-red-700">
                    <FaExclamationTriangle />

                    <p className="font-semibold">{detailError}</p>
                  </div>
                </div>
              )}

              {!detailLoading && !detailError && alertDetail && (
                <div className="space-y-6">
                  {/* Reason */}

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <FaInfoCircle className="text-blue-600" />

                      <h3 className="text-lg font-bold text-blue-900">
                        Why is this alert appearing?
                      </h3>
                    </div>

                    <p className="text-gray-700 leading-7">
                      {alertDetail.reason}
                    </p>
                  </div>

                  {/* Evidence */}

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Model Evidence
                    </h3>

                    <div className="space-y-2">
                      {alertDetail.evidence.length === 0 ? (
                        <p className="text-gray-500">
                          No additional prediction evidence was stored.
                        </p>
                      ) : (
                        alertDetail.evidence.map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="rounded-lg bg-gray-50 border p-3 text-gray-700"
                          >
                            {item}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recommendation */}

                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <h3 className="text-lg font-bold text-green-900 mb-2">
                      Model Recommendation
                    </h3>

                    <p className="text-gray-700 leading-7">
                      {alertDetail.recommendation}
                    </p>
                  </div>

                  {/* Prediction timestamp */}

                  {alertDetail.prediction_time && (
                    <p className="text-xs text-gray-400">
                      Based on prediction recorded at{" "}
                      {new Date(alertDetail.prediction_time).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}

            <div className="border-t px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={closeDetails}
                className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
