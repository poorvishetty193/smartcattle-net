"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  FaChartLine,
  FaPlus,
  FaPaw,
  FaSearch,
  FaThLarge,
  FaList,
  FaTimes,
  FaTrash,
  FaThermometerHalf,
  FaHeartbeat,
  FaTint,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const API_URL = "http://127.0.0.1:8000";

type Cow = {
  cow_id: string;

  breed?: string | null;

  parity?: number | null;

  days_in_milk?: number | null;

  notes?: string | null;

  is_active?: boolean | null;
};

type Prediction = {
  risk_level?: string | null;

  health_score?: number | null;

  productivity_score?: number | null;

  stress_probability?: number | null;

  stress_flag?: number | null;

  milk_drop_probability?: number | null;

  daily_milk_yield?: number | null;

  milk_quantity?: number | null;

  milk_stability_index?: number | null;

  recommendation?: string | null;
};

type CowWithPrediction = Cow & {
  prediction?: Prediction | null;
};

type FilterType = "all" | "risk" | "heat" | "healthy" | "maternity";

type ViewType = "grid" | "list";

type CowForm = {
  cow_id: string;

  breed: string;

  parity: string;

  days_in_milk: string;

  notes: string;
};

export default function HerdPage() {
  const [cows, setCows] = useState<CowWithPrediction[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<FilterType>("all");

  const [view, setView] = useState<ViewType>("grid");

  const [showAddModal, setShowAddModal] = useState(false);

  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState<CowForm>({
    cow_id: "",

    breed: "",

    parity: "",

    days_in_milk: "",

    notes: "",
  });

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
  };

  const getPredictionFromHistory = (data: any): Prediction | null => {
    const records = Array.isArray(data)
      ? data
      : data?.records ||
        data?.history ||
        data?.predictions ||
        data?.items ||
        [];

    if (!Array.isArray(records) || records.length === 0) {
      return null;
    }

    const latest = records[0];

    /*

     Your PredictionRecord contains stage outputs and raw_response.

     This helper supports both direct fields and the stored

     raw_response structure.

     */

    const raw = latest?.raw_response ?? {};

    const response = raw?.response ?? raw ?? {};

    const stage1 = response?.stage1_daily_yield ?? {};

    const stage2 = response?.stage2_milk_drop ?? {};

    const stage3 = response?.stage3_next_milking ?? {};

    const stage4 = response?.stage4_msi ?? {};

    const stage5 = response?.stage5_quantity ?? {};

    const stage7 = response?.stage7_productivity ?? {};

    const stage8 = response?.stage8_stress ?? {};

    const stage9 = response?.stage9_recommendation ?? {};

    const stage12 = response?.stage12_risk ?? {};

    return {
      risk_level:
        latest?.risk_level ??
        response?.risk_level ??
        stage12?.risk_level ??
        null,

      health_score: latest?.health_score ?? response?.health_score ?? null,

      productivity_score:
        latest?.productivity_score ??
        response?.productivity_score ??
        stage7?.productivity_score ??
        null,

      stress_probability:
        latest?.stress_probability ??
        response?.stress_probability ??
        stage8?.stress_probability ??
        null,

      stress_flag:
        latest?.stress_flag ??
        response?.stress_flag ??
        stage8?.stress_flag ??
        null,

      milk_drop_probability:
        latest?.milk_drop_probability ??
        response?.milk_drop_probability ??
        stage2?.milk_drop_probability ??
        null,

      daily_milk_yield:
        latest?.daily_milk_yield ??
        response?.daily_milk_yield ??
        stage1?.daily_yield ??
        stage1?.s1_daily_yield ??
        null,

      milk_quantity:
        latest?.milk_quantity ??
        response?.milk_quantity ??
        stage5?.milk_quantity ??
        null,

      milk_stability_index:
        latest?.milk_stability_index ??
        response?.milk_stability_index ??
        stage4?.milk_stability_index ??
        stage4?.s4_msi ??
        null,

      recommendation:
        latest?.recommendation ??
        response?.recommendation ??
        stage9?.recommendation ??
        null,
    };
  };

  const loadCows = async () => {
    setLoading(true);

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/cows`, {
        method: "GET",

        headers: {
          Accept: "application/json",

          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        throw new Error(`Failed to load cows (${response.status}).`);
      }

      const data = await response.json();

      const cowList: Cow[] = Array.isArray(data)
        ? data
        : data?.cows || data?.items || [];

      /*

       Get the latest prediction for every cow.


       If a cow has no prediction yet, the cow still appears.

       */

      const cowsWithPredictions = await Promise.all(
        cowList.map(async (cow) => {
          try {
            const historyResponse = await fetch(
              `${API_URL}/predict/history?cow_id=${encodeURIComponent(
                cow.cow_id,
              )}&skip=0&limit=1`,

              {
                method: "GET",

                headers: {
                  Accept: "application/json",

                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (!historyResponse.ok) {
              return {
                ...cow,

                prediction: null,
              };
            }

            const historyData = await historyResponse.json();

            return {
              ...cow,

              prediction: getPredictionFromHistory(historyData),
            };
          } catch {
            return {
              ...cow,

              prediction: null,
            };
          }
        }),
      );

      setCows(cowsWithPredictions);
    } catch (err) {
      console.error("Herd loading error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load your herd.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCows();
  }, []);

  const getCowStatus = (
    cow: CowWithPrediction,
  ): "risk" | "heat" | "healthy" | "unknown" => {
    const prediction = cow.prediction;

    if (!prediction) {
      return "unknown";
    }

    if (
      prediction.stress_flag === 1 ||
      (typeof prediction.stress_probability === "number" &&
        prediction.stress_probability >= 0.5)
    ) {
      return "heat";
    }

    const risk = prediction.risk_level?.toLowerCase();

    if (risk === "high" || risk === "critical" || risk === "severe") {
      return "risk";
    }

    if (risk === "low" || risk === "normal") {
      return "healthy";
    }

    return "unknown";
  };

  const filteredCows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cows.filter((cow) => {
      const matchesSearch =
        !query ||
        cow.cow_id.toLowerCase().includes(query) ||
        cow.breed?.toLowerCase().includes(query) ||
        cow.notes?.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "all") {
        return true;
      }

      if (filter === "maternity") {
        /*

         No maternity field currently exists in the /cows model,

         so don't fabricate maternity status.

         */

        return false;
      }

      return getCowStatus(cow) === filter;
    });
  }, [cows, search, filter]);

  const totalCows = cows.length;

  const activeCows = cows.filter((cow) => cow.is_active !== false).length;

  const riskCows = cows.filter((cow) => getCowStatus(cow) === "risk").length;

  const heatCows = cows.filter((cow) => getCowStatus(cow) === "heat").length;

  const healthyCows = cows.filter(
    (cow) => getCowStatus(cow) === "healthy",
  ).length;

  const updateForm = (
    field: keyof CowForm,

    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,

      [field]: value,
    }));
  };

  const addCow = async () => {
    setError("");

    if (!form.cow_id.trim()) {
      setError("Cow ID is required.");

      return;
    }

    if (!form.breed.trim()) {
      setError("Breed is required.");

      return;
    }

    setAdding(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const body = {
        cow_id: form.cow_id.trim(),

        breed: form.breed.trim(),

        parity: form.parity ? Number(form.parity) : 0,

        days_in_milk: form.days_in_milk ? Number(form.days_in_milk) : 0,

        notes: form.notes.trim() || null,
      };

      const response = await fetch(`${API_URL}/cows`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let detail = "";

        try {
          const data = await response.json();

          if (typeof data?.detail === "string") {
            detail = data.detail;
          }
        } catch {
          // Ignore non-JSON errors.
        }

        throw new Error(detail || `Failed to add cow (${response.status}).`);
      }

      setForm({
        cow_id: "",

        breed: "",

        parity: "",

        days_in_milk: "",

        notes: "",
      });

      setShowAddModal(false);

      await loadCows();
    } catch (err) {
      console.error("Add cow error:", err);

      setError(err instanceof Error ? err.message : "Unable to add cow.");
    } finally {
      setAdding(false);
    }
  };

  const removeCow = async (cow: CowWithPrediction) => {
    /*

     Your backend does not currently have a confirmed DELETE

     /cows/{cow_id} endpoint.


     Therefore we don't send a fake DELETE request.

     */

    setError(
      `Safe removal for ${cow.cow_id} is not connected yet. We will use is_active=false so prediction history is preserved.`,
    );
  };

  const getStatusInfo = (cow: CowWithPrediction) => {
    const status = getCowStatus(cow);

    if (status === "risk") {
      return {
        label: "AT RISK",

        className: "bg-red-500 text-white",

        border: "hover:border-red-400",
      };
    }

    if (status === "heat") {
      return {
        label: "HEAT STRESS",

        className: "bg-amber-500 text-white",

        border: "hover:border-amber-400",
      };
    }

    if (status === "healthy") {
      return {
        label: "HEALTHY",

        className: "bg-emerald-600 text-white",

        border: "hover:border-emerald-500",
      };
    }

    return {
      label: cow.is_active === false ? "INACTIVE" : "NO PREDICTION",

      className:
        cow.is_active === false
          ? "bg-gray-400 text-white"
          : "bg-gray-200 text-gray-700",

      border: "hover:border-emerald-400",
    };
  };

  const getPercentage = (value: number | null | undefined) => {
    if (typeof value !== "number") {
      return null;
    }

    if (value >= 0 && value <= 1) {
      return Math.round(value * 100);
    }

    return Math.round(value);
  };

  return (
    <div className="min-h-screen bg-[#f5fbf5] text-[#171d1a]">
      {/* MAIN */}

      <main className="min-h-screen">
        <div className="mx-auto max-w-[1440px] p-6">
          {/* ACTION HEADER */}

          <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">All cows</h2>

              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                {totalCows} total
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID or breed..."
                  className="w-full rounded-xl border border-[#bccac1] bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#00694c] focus:ring-2 focus:ring-[#00694c]/10 sm:w-72"
                />
              </div>

              {/* VIEW TOGGLE */}

              <div className="flex rounded-xl border border-[#bccac1] bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                    view === "grid"
                      ? "bg-white text-[#00694c] shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <FaThLarge />
                  Grid
                </button>

                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                    view === "list"
                      ? "bg-white text-[#00694c] shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <FaList />
                  List
                </button>
              </div>
            </div>
          </section>

          {/* FILTERS */}

          <section className="mb-8 flex flex-wrap gap-3">
            {[
              {
                id: "all",

                label: `All`,

                count: totalCows,
              },

              {
                id: "risk",

                label: "At risk",

                count: riskCows,
              },

              {
                id: "heat",

                label: "Heat stress",

                count: heatCows,
              },

              {
                id: "healthy",

                label: "Healthy",

                count: healthyCows,
              },

              {
                id: "maternity",

                label: "Maternity",

                count: 0,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id as FilterType)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item.id
                    ? "bg-[#00694c] text-white"
                    : "border border-[#bccac1] bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}

                <span className="ml-2 opacity-70">{item.count}</span>
              </button>
            ))}
          </section>

          {/* ERROR */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <FaExclamationTriangle className="mt-1 shrink-0" />

              <div className="flex-1 text-sm">
                <p className="font-semibold">Something went wrong</p>

                <p className="mt-1">{error}</p>
              </div>

              <button type="button" onClick={() => setError("")}>
                <FaTimes />
              </button>
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#00694c]" />

              <p className="mt-4 text-sm text-gray-500">Loading your herd...</p>
            </div>
          ) : (
            <>
              {/* COW GRID */}

              {view === "grid" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCows.map((cow) => {
                    const status = getStatusInfo(cow);

                    const prediction = cow.prediction;

                    const productivity = getPercentage(
                      prediction?.productivity_score,
                    );

                    const health = getPercentage(prediction?.health_score);

                    const stress = getPercentage(
                      prediction?.stress_probability,
                    );

                    const stability = getPercentage(
                      prediction?.milk_stability_index,
                    );

                    return (
                      <div
                        key={cow.cow_id}
                        className={`flex flex-col gap-4 rounded-2xl border border-[#bccac1] bg-white p-5 shadow-sm transition hover:shadow-lg ${status.border}`}
                      >
                        {/* CARD HEADER */}

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4eee7] text-xl text-[#00694c]">
                              <FaPaw />
                            </div>

                            <div>
                              <p className="text-lg font-bold leading-tight">
                                {cow.cow_id}
                              </p>

                              <p className="text-xs text-gray-500">
                                {cow.breed || "Breed not specified"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold`}
                          >
                            <span
                              className={`${status.className} rounded-full px-3 py-1`}
                            >
                              {status.label}
                            </span>
                          </span>
                        </div>

                        {/* MINI METRICS */}

                        <div className="grid grid-cols-4 gap-2">
                          <MiniMetric
                            label="PROD"
                            value={productivity}
                            icon={<FaChartLine />}
                          />

                          <MiniMetric
                            label="HLTH"
                            value={health}
                            icon={<FaHeartbeat />}
                          />

                          <MiniMetric
                            label="STAB"
                            value={stability}
                            icon={<FaTint />}
                          />

                          <MiniMetric
                            label="STRS"
                            value={stress}
                            icon={<FaThermometerHalf />}
                          />
                        </div>

                        {/* PREDICTION BADGES */}

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="text-[10px] font-bold text-emerald-700">
                              MILK
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-800">
                              {typeof prediction?.daily_milk_yield === "number"
                                ? `${prediction.daily_milk_yield.toFixed(1)} L`
                                : "No prediction"}
                            </p>
                          </div>

                          <div
                            className={`rounded-xl p-3 ${
                              status === undefined
                                ? "bg-gray-50"
                                : getCowStatus(cow) === "risk"
                                  ? "bg-red-50"
                                  : getCowStatus(cow) === "heat"
                                    ? "bg-amber-50"
                                    : "bg-purple-50"
                            }`}
                          >
                            <p className="text-[10px] font-bold text-gray-500">
                              STATUS
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-gray-800">
                              {prediction?.risk_level || "Awaiting prediction"}
                            </p>
                          </div>
                        </div>

                        {/* BASIC DATA */}

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-400">Parity</p>

                            <p className="mt-1 font-semibold">
                              {cow.parity ?? "—"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-400">
                              Days in Milk
                            </p>

                            <p className="mt-1 font-semibold">
                              {cow.days_in_milk ?? "—"}
                            </p>
                          </div>
                        </div>

                        {/* PROFILE */}

                        <div className="mt-auto border-t border-gray-200 pt-4">
                          <Link
                            href={`/herd/${encodeURIComponent(cow.cow_id)}`}
                            className="flex items-center justify-center gap-2 font-semibold text-[#00694c] hover:underline"
                          >
                            View full profile
                            <FaArrowRight className="text-xs" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {/* ADD COW */}

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#bccac1] bg-transparent p-6 transition hover:bg-[#eaf3ed]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e4eee7] text-2xl text-[#00694c]">
                      <FaPlus />
                    </div>

                    <span className="font-semibold text-[#00694c]">
                      Register New Asset
                    </span>

                    <span className="max-w-[220px] text-center text-xs text-gray-500">
                      Configure your cow's biological profile
                    </span>
                  </button>
                </div>
              )}

              {/* LIST VIEW */}

              {view === "list" && (
                <div className="overflow-hidden rounded-2xl border border-[#bccac1] bg-white">
                  <div className="hidden grid-cols-7 gap-4 border-b bg-gray-50 px-5 py-4 text-xs font-bold uppercase text-gray-500 md:grid">
                    <span>Cow</span>

                    <span>Breed</span>

                    <span>Parity</span>

                    <span>DIM</span>

                    <span>Status</span>

                    <span>Milk</span>

                    <span />
                  </div>

                  {filteredCows.map((cow) => {
                    const status = getStatusInfo(cow);

                    return (
                      <div
                        key={cow.cow_id}
                        className="grid grid-cols-1 gap-3 border-b px-5 py-5 last:border-b-0 md:grid-cols-7 md:items-center md:gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4eee7] text-[#00694c]">
                            <FaPaw />
                          </div>

                          <span className="font-bold">{cow.cow_id}</span>
                        </div>

                        <span className="text-sm">{cow.breed || "—"}</span>

                        <span className="text-sm">{cow.parity ?? "—"}</span>

                        <span className="text-sm">
                          {cow.days_in_milk ?? "—"}
                        </span>

                        <span>
                          <span
                            className={`${status.className} rounded-full px-3 py-1 text-[10px] font-bold`}
                          >
                            {status.label}
                          </span>
                        </span>

                        <span className="text-sm font-semibold">
                          {typeof cow.prediction?.daily_milk_yield === "number"
                            ? `${cow.prediction.daily_milk_yield.toFixed(1)} L`
                            : "—"}
                        </span>

                        <Link
                          href={`/herd/${encodeURIComponent(cow.cow_id)}`}
                          className="font-semibold text-[#00694c] hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* EMPTY */}

              {filteredCows.length === 0 && (
                <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
                  <FaPaw className="mx-auto text-5xl text-emerald-100" />

                  <h3 className="mt-5 text-xl font-bold">
                    {cows.length === 0
                      ? "No cows registered yet"
                      : "No cows found"}
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                    {cows.length === 0
                      ? "Register your first cow to start using SmartCattleNet."
                      : "Try another search or filter."}
                  </p>

                  {cows.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="mt-6 rounded-xl bg-[#00694c] px-6 py-3 font-semibold text-white hover:bg-[#00583f]"
                    >
                      <FaPlus className="mr-2 inline" />
                      Register Cow
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ADD COW MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold">Register New Cow</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a cow to your active herd.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-3 text-gray-500 hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Cow ID *
                </label>

                <input
                  value={form.cow_id}
                  onChange={(e) =>
                    updateForm(
                      "cow_id",

                      e.target.value,
                    )
                  }
                  placeholder="Example: C01"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 uppercase outline-none focus:border-[#00694c] focus:ring-2 focus:ring-[#00694c]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Breed *
                </label>

                <input
                  value={form.breed}
                  onChange={(e) =>
                    updateForm(
                      "breed",

                      e.target.value,
                    )
                  }
                  placeholder="Example: Holstein"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#00694c] focus:ring-2 focus:ring-[#00694c]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Parity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.parity}
                    onChange={(e) =>
                      updateForm(
                        "parity",

                        e.target.value,
                      )
                    }
                    placeholder="Example: 3"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#00694c]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Days in Milk
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.days_in_milk}
                    onChange={(e) =>
                      updateForm(
                        "days_in_milk",

                        e.target.value,
                      )
                    }
                    placeholder="Example: 100"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#00694c]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    updateForm(
                      "notes",

                      e.target.value,
                    )
                  }
                  rows={4}
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#00694c]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={adding || !form.cow_id.trim() || !form.breed.trim()}
                  onClick={() => void addCow()}
                  className="flex-1 rounded-xl bg-[#00694c] px-5 py-3 font-semibold text-white hover:bg-[#00583f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? "Registering..." : "Register Cow"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniMetric({
  label,

  value,

  icon,
}: {
  label: string;

  value: number | null;

  icon: React.ReactNode;
}) {
  const safeValue =
    typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex h-14 items-end justify-center overflow-hidden rounded-md bg-gray-100">
        {value !== null ? (
          <div
            className="w-full bg-[#00694c] transition-all"
            style={{
              height: `${Math.max(
                8,

                safeValue,
              )}%`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            {icon}
          </div>
        )}
      </div>

      <span className="text-center text-[9px] font-bold text-gray-400">
        {label}
      </span>
    </div>
  );
}
