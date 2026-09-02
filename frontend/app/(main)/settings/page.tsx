"use client";

import { useEffect, useState } from "react";

type NotificationSetting = {
  push: boolean;
  email: boolean;
  sms: boolean;
  frequency?: string;
};

type SettingsResponse = {
  farm: {
    farm_name: string;
    farm_location: string;
    timezone: string;
  };
  thresholds: {
    milk_drop_threshold: number;
    heat_stress_thi: number;
    scc_mastitis_threshold: number;
    priority_score_cutoff: number;
  };
  notifications: {
    critical_push: boolean;
    critical_email: boolean;
    critical_sms: boolean;
    daily_report_email: boolean;
    heat_push: boolean;
    heat_email: boolean;
    heat_sms: boolean;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function SettingsPage() {
  const [editingFarm, setEditingFarm] = useState(false);

  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [timezone, setTimezone] = useState("CST (UTC -6)");

  const [milkDrop, setMilkDrop] = useState(15);
  const [thi, setThi] = useState(72);
  const [scc, setScc] = useState(200);
  const [priority, setPriority] = useState(85);

  const [notifications, setNotifications] = useState<
    Record<string, NotificationSetting>
  >({
    critical: {
      push: true,
      email: true,
      sms: true,
    },
    reports: {
      push: false,
      email: true,
      sms: false,
    },
    heat: {
      push: true,
      email: true,
      sms: false,
      frequency: "Immediate",
    },
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingFarm, setSavingFarm] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [resetting, setResetting] = useState(false);

  const showMessage = (text: string, duration = 2500) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, duration);
  };

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  };

  // ================================
  // LOAD SETTINGS FROM BACKEND
  // ================================
  useEffect(() => {
    const loadSettings = async () => {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/settings`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load settings.");
        }

        const data: SettingsResponse = await response.json();

        // Farm
        setFarmName(data.farm.farm_name || "");
        setFarmLocation(data.farm.farm_location || "");
        setTimezone(data.farm.timezone || "CST (UTC -6)");

        // Thresholds
        setMilkDrop(data.thresholds.milk_drop_threshold);
        setThi(data.thresholds.heat_stress_thi);

        // Backend stores SCC as actual value.
        // UI displays it in thousands.
        setScc(Math.round(data.thresholds.scc_mastitis_threshold / 1000));

        // Backend stores priority as 0-10.
        // UI slider uses 0-100.
        setPriority(Math.round(data.thresholds.priority_score_cutoff * 10));

        // Notifications
        setNotifications({
          critical: {
            push: data.notifications.critical_push,
            email: data.notifications.critical_email,
            sms: data.notifications.critical_sms,
          },
          reports: {
            push: false,
            email: data.notifications.daily_report_email,
            sms: false,
          },
          heat: {
            push: data.notifications.heat_push,
            email: data.notifications.heat_email,
            sms: data.notifications.heat_sms,
            frequency: "Immediate",
          },
        });
      } catch (error) {
        console.error("Settings load error:", error);
        showMessage("Failed to load settings.", 3500);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ================================
  // UPDATE NOTIFICATION UI
  // ================================
  const updateNotification = (
    type: string,
    channel: "push" | "email" | "sms",
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel],
      },
    }));
  };

  // ================================
  // SAVE FARM DETAILS
  // ================================
  const saveFarmDetails = async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setSavingFarm(true);

      const response = await fetch(`${API_URL}/settings/farm`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm_name: farmName,
          farm_location: farmLocation,
          timezone,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Farm save error:", errorData);
        throw new Error("Failed to save farm details.");
      }

      setEditingFarm(false);
      showMessage("Farm details saved successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Failed to save farm details.", 3500);
    } finally {
      setSavingFarm(false);
    }
  };

  // ================================
  // SAVE MODEL THRESHOLDS
  // ================================
  const saveThresholds = async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setSavingThresholds(true);

      const response = await fetch(`${API_URL}/settings/thresholds`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milk_drop_threshold: milkDrop,
          heat_stress_thi: thi,

          // UI is in thousands, backend stores actual SCC.
          scc_mastitis_threshold: scc * 1000,

          // UI is 0-100, backend is 0-10.
          priority_score_cutoff: priority / 10,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Threshold save error:", errorData);
        throw new Error("Failed to save thresholds.");
      }

      showMessage("Model thresholds saved successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Failed to save model thresholds.", 3500);
    } finally {
      setSavingThresholds(false);
    }
  };

  // ================================
  // RESET THRESHOLDS
  // ================================
  const resetDefaults = async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setResetting(true);

      const response = await fetch(`${API_URL}/settings/thresholds/reset`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to reset thresholds.");
      }

      const data = await response.json();

      setMilkDrop(data.milk_drop_threshold);
      setThi(data.heat_stress_thi);
      setScc(Math.round(data.scc_mastitis_threshold / 1000));
      setPriority(Math.round(data.priority_score_cutoff * 10));

      showMessage("Model thresholds reset to default values.");
    } catch (error) {
      console.error(error);
      showMessage("Failed to reset model thresholds.", 3500);
    } finally {
      setResetting(false);
    }
  };

  // ================================
  // SAVE NOTIFICATIONS
  // ================================
  const saveNotifications = async () => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setSavingNotifications(true);

      const response = await fetch(`${API_URL}/settings/notifications`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          critical_push: notifications.critical.push,
          critical_email: notifications.critical.email,
          critical_sms: notifications.critical.sms,

          daily_report_email: notifications.reports.email,

          heat_push: notifications.heat.push,
          heat_email: notifications.heat.email,
          heat_sms: notifications.heat.sms,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Notification save error:", errorData);
        throw new Error("Failed to save notification settings.");
      }

      showMessage("Notification preferences saved successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Failed to save notification preferences.", 3500);
    } finally {
      setSavingNotifications(false);
    }
  };

  // ================================
  // EXPORT SETTINGS
  // ================================
  const handleExport = () => {
    const data = {
      farmName,
      farmLocation,
      timezone,
      thresholds: {
        milkDropAlert: milkDrop,
        heatStressTHI: thi,
        sccMastitis: scc,
        priorityScore: (priority / 10).toFixed(1),
      },
      notifications,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "smartcattle-settings.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("Settings exported successfully.");
  };

  // ================================
  // RE-RUN PREDICTIONS
  // ================================
  const handleRerun = () => {
    showMessage("Prediction re-run is not connected to the backend yet.", 3500);
  };

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ================================
  // LOADING SCREEN
  // ================================
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d8e4dc] border-t-[#00694c]" />
          <p className="text-sm text-[#6d7a73]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Success / action message */}
      {message && (
        <div className="fixed right-6 top-20 z-50 rounded-lg bg-[#00694c] px-5 py-3 text-sm font-medium text-white shadow-lg">
          {message}
        </div>
      )}

      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6d7a73]">
              SmartCattle Net
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-[#171d1a]">
              Settings
            </h1>

            <p className="max-w-2xl text-sm text-[#6d7a73]">
              Manage your farm profile, AI thresholds, notification preferences,
              and data settings.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Settings Navigation */}
          <aside className="w-full shrink-0 md:w-64">
            <nav className="sticky top-24 flex flex-col gap-1">
              <a
                href="#farm-profile"
                className="flex items-center gap-3 rounded-lg bg-[#008560] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#00694c]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  agriculture
                </span>
                <span>Farm profile</span>
              </a>

              <a
                href="#notifications"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#3d4943] transition hover:bg-[#eff5ef]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications_active
                </span>
                <span>Notifications</span>
              </a>

              <a
                href="#thresholds"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#3d4943] transition hover:bg-[#eff5ef]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  tune
                </span>
                <span>Model thresholds</span>
              </a>

              <a
                href="#data-export"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#3d4943] transition hover:bg-[#eff5ef]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  database
                </span>
                <span>Data & export</span>
              </a>

              <div className="my-4 h-px bg-[#bccac1]/40" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-[#ba1a1a] transition hover:bg-[#ffdad6]/30"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Settings Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            {/* ================= FARM PROFILE ================= */}
            <section
              id="farm-profile"
              className="overflow-hidden rounded-xl border border-[#bccac1]/30 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#bccac1]/30 px-6 py-4">
                <h2 className="text-base font-semibold text-[#171d1a]">
                  Farm profile
                </h2>

                {!editingFarm ? (
                  <button
                    type="button"
                    onClick={() => setEditingFarm(true)}
                    className="text-sm font-medium text-[#00694c] hover:underline"
                  >
                    Edit details
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveFarmDetails}
                    disabled={savingFarm}
                    className="rounded-lg bg-[#00694c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00513a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingFarm ? "Saving..." : "Save details"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2">
                <div className="flex flex-col gap-6">
                  {/* Farm Name */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                      Farm Name
                    </label>

                    {editingFarm ? (
                      <input
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full rounded-lg border border-[#bccac1] bg-white px-3 py-2 text-sm text-[#171d1a] outline-none focus:border-[#00694c] focus:ring-2 focus:ring-[#00694c]/20"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-[#171d1a]">
                        {farmName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                        Herd Size
                      </p>

                      <p className="text-sm text-[#171d1a]">1,250 Head</p>
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                        Timezone
                      </p>

                      <p className="text-sm text-[#171d1a]">{timezone}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-[#6d7a73]">
                    <span className="material-symbols-outlined text-[20px]">
                      location_on
                    </span>

                    {editingFarm ? (
                      <input
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        className="w-full rounded-lg border border-[#bccac1] bg-white px-3 py-2 text-sm text-[#171d1a] outline-none focus:border-[#00694c] focus:ring-2 focus:ring-[#00694c]/20"
                      />
                    ) : (
                      <div className="text-xs leading-5">{farmLocation}</div>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="relative h-40 overflow-hidden rounded-lg bg-[#eff5ef]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined mb-2 text-4xl text-[#00694c]/50">
                      map
                    </span>

                    <p className="text-xs font-semibold text-[#3d4943]">
                      FARM LOCATION
                    </p>

                    <p className="mt-1 text-[11px] text-[#6d7a73]">
                      {farmLocation || "Farm location not set"}
                    </p>
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md border border-[#bccac1]/30 bg-white/90 px-2 py-1 backdrop-blur">
                    <span className="material-symbols-outlined text-[14px]">
                      location_on
                    </span>

                    <span className="text-[10px] font-bold">MAP VIEW</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= MODEL THRESHOLDS ================= */}
            <section
              id="thresholds"
              className="overflow-hidden rounded-xl border border-[#bccac1]/30 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-[#bccac1]/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#171d1a]">
                    Model thresholds
                  </h2>

                  <p className="mt-1 text-xs text-[#6d7a73]">
                    Tune the AI sensitivity for alerts and risk scoring.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={resetDefaults}
                    disabled={resetting}
                    className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#0060a8] hover:underline disabled:opacity-50"
                  >
                    {resetting ? "Resetting..." : "Reset to Default"}
                  </button>

                  <button
                    type="button"
                    onClick={saveThresholds}
                    disabled={savingThresholds}
                    className="rounded-lg bg-[#00694c] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00513a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingThresholds ? "Saving..." : "Save thresholds"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-12 gap-y-8 p-6 sm:grid-cols-2">
                {/* Milk Drop */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#171d1a]">
                      Milk drop alert
                    </label>

                    <span className="text-base font-semibold text-[#00694c]">
                      -{milkDrop}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milkDrop}
                    onChange={(e) => setMilkDrop(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#00694c]"
                  />

                  <p className="text-[10px] leading-4 text-[#6d7a73]">
                    Triggers when daily yield falls below rolling 7-day avg.
                  </p>
                </div>

                {/* Heat Stress */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#171d1a]">
                      Heat stress THI
                    </label>

                    <span className="text-base font-semibold text-[#ba1a1a]">
                      {thi} THI
                    </span>
                  </div>

                  <input
                    type="range"
                    min="60"
                    max="90"
                    value={thi}
                    onChange={(e) => setThi(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#ba1a1a]"
                  />

                  <p className="text-[10px] leading-4 text-[#6d7a73]">
                    Temperature-Humidity Index threshold for heat intervention.
                  </p>
                </div>

                {/* SCC */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#171d1a]">
                      SCC mastitis
                    </label>

                    <span className="text-base font-semibold text-[#574eb1]">
                      {scc}k+
                    </span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={scc}
                    onChange={(e) => setScc(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#574eb1]"
                  />

                  <p className="text-[10px] leading-4 text-[#6d7a73]">
                    Somatic Cell Count cutoff for predictive mastitis detection.
                  </p>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#171d1a]">
                      Priority score cutoff
                    </label>

                    <span className="text-base font-semibold text-[#0060a8]">
                      {(priority / 10).toFixed(1)} / 10
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer accent-[#0060a8]"
                  />

                  <p className="text-[10px] leading-4 text-[#6d7a73]">
                    Global sensitivity for High Priority dashboard
                    categorization.
                  </p>
                </div>
              </div>

              {/* AI Auto Tune */}
              <div className="flex items-start gap-3 border-t border-[#bccac1]/30 bg-[#e4dfff]/30 p-4">
                <span className="material-symbols-outlined text-[#574eb1]">
                  auto_awesome
                </span>

                <p className="text-xs leading-5 text-[#41379b]">
                  AI Thresholds are currently being auto-tuned based on
                  historical farm performance from the last 90 days.
                </p>
              </div>
            </section>

            {/* ================= NOTIFICATIONS ================= */}
            <section
              id="notifications"
              className="overflow-hidden rounded-xl border border-[#bccac1]/30 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#bccac1]/30 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#171d1a]">
                    Notification preferences
                  </h2>

                  <p className="mt-1 text-xs text-[#6d7a73]">
                    Choose how SmartCattleNet should notify you.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={saveNotifications}
                  disabled={savingNotifications}
                  className="rounded-lg bg-[#00694c] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00513a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingNotifications ? "Saving..." : "Save notifications"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead className="border-b border-[#bccac1]/20 bg-[#eff5ef]">
                    <tr>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                        Alert Type
                      </th>

                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                        Push
                      </th>

                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                        Email
                      </th>

                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                        SMS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Critical */}
                    <tr className="border-b border-[#bccac1]/10 transition hover:bg-[#eff5ef]">
                      <td className="px-6 py-4 text-sm font-medium text-[#171d1a]">
                        Critical Health Alerts
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.critical.push}
                          onChange={() =>
                            updateNotification("critical", "push")
                          }
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.critical.email}
                          onChange={() =>
                            updateNotification("critical", "email")
                          }
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.critical.sms}
                          onChange={() => updateNotification("critical", "sms")}
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>
                    </tr>

                    {/* Reports */}
                    <tr className="border-b border-[#bccac1]/10 transition hover:bg-[#eff5ef]">
                      <td className="px-6 py-4 text-sm font-medium text-[#171d1a]">
                        Daily Insight Reports
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.reports.push}
                          onChange={() => updateNotification("reports", "push")}
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.reports.email}
                          onChange={() =>
                            updateNotification("reports", "email")
                          }
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.reports.sms}
                          onChange={() => updateNotification("reports", "sms")}
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>
                    </tr>

                    {/* Heat */}
                    <tr className="transition hover:bg-[#eff5ef]">
                      <td className="px-6 py-4 text-sm font-medium text-[#171d1a]">
                        Heat Detection Windows
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.heat.push}
                          onChange={() => updateNotification("heat", "push")}
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <select
                          value={notifications.heat.frequency}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              heat: {
                                ...prev.heat,
                                frequency: e.target.value,
                                email: true,
                              },
                            }))
                          }
                          className="rounded border-0 bg-transparent p-0 text-xs font-bold text-[#00694c] outline-none focus:ring-0"
                        >
                          <option>Immediate</option>
                          <option>Hourly</option>
                          <option>Daily Digest</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifications.heat.sms}
                          onChange={() => updateNotification("heat", "sms")}
                          className="h-5 w-5 cursor-pointer rounded accent-[#00694c]"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ================= DATA MANAGEMENT ================= */}
            <section
              id="data-export"
              className="overflow-hidden rounded-xl border border-[#bccac1]/30 bg-white shadow-sm"
            >
              <div className="border-b border-[#bccac1]/30 px-6 py-4">
                <h2 className="text-base font-semibold text-[#171d1a]">
                  Data management
                </h2>

                <p className="mt-1 text-xs text-[#6d7a73]">
                  Manage your SmartCattleNet prediction data.
                </p>
              </div>

              <div className="flex flex-col items-center gap-8 p-6 md:flex-row">
                <div className="w-full flex-grow">
                  <div className="mb-2 flex justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6d7a73]">
                      Cloud Storage Usage
                    </p>

                    <p className="text-xs text-[#171d1a]">4.2 GB / 10 GB</p>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#eaefea]">
                    <div className="h-full w-[42%] rounded-full bg-[#0060a8]" />
                  </div>

                  <p className="mt-4 text-xs italic text-[#6d7a73]">
                    Last full prediction run:{" "}
                    <span className="font-semibold text-[#171d1a]">
                      Today, 04:30 AM
                    </span>
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#bccac1] bg-[#eaefea] px-6 py-2.5 text-sm font-semibold text-[#171d1a] transition hover:bg-[#dee4de] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      download
                    </span>

                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRerun}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#00694c] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#00694c]/20 transition hover:bg-[#00513a] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      refresh
                    </span>

                    <span>Re-run predictions</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
