
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaPaw,
  FaSearch,
  FaPlus,
  FaHeart,
  FaThermometerHalf,
  FaExclamationTriangle,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

type Cow = {
  cow_id: string;
  breed?: string | null;
  parity?: number | null;
  days_in_milk?: number | null;
  notes?: string | null;
  is_active?: boolean | null;
};

type CowForm = {
  cow_id: string;
  breed: string;
  parity: string;
  days_in_milk: string;
  notes: string;
};

type FilterType = "all" | "healthy" | "risk" | "heat";

const API_URL = "http://127.0.0.1:8000";

export default function HerdPage() {
  const router = useRouter();

  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);

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

        throw new Error(`Failed to load cows: ${response.status}`);
      }

      const data = await response.json();

      /*
       * Backend may return either:
       *
       * [
       *   { cow_id: "C01", ... }
       * ]
       *
       * or:
       *
       * { cows: [...] }
       *
       * Support both formats.
       */
      const cowList = Array.isArray(data) ? data : data.cows || [];

      setCows(cowList);
    } catch (err) {
      console.error("Load cows error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your herd."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCows();
  }, []);

  const filteredCows = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return cows.filter((cow) => {
      const matchesSearch =
        !searchText ||
        cow.cow_id.toLowerCase().includes(searchText) ||
        cow.breed?.toLowerCase().includes(searchText);

      /*
       * The current /cows endpoint only provides cow information.
       * Prediction-based filters will become fully dynamic when we
       * connect the latest PredictionRecord data to the Herd page.
       *
       * For now, don't incorrectly classify cows as healthy/risk/heat
       * without prediction data.
       */
      const matchesFilter = filter === "all";

      return matchesSearch && matchesFilter;
    });
  }, [cows, search, filter]);

  const handleFormChange = (
    field: keyof CowForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const addCow = async () => {
    setError("");

    const cowId = form.cow_id.trim();

    if (!cowId) {
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
        cow_id: cowId,
        breed: form.breed.trim(),
        parity: form.parity ? Number(form.parity) : 0,
        days_in_milk: form.days_in_milk
          ? Number(form.days_in_milk)
          : 0,
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
          const errorData = await response.json();

          if (typeof errorData?.detail === "string") {
            detail = errorData.detail;
          }
        } catch {
          // Ignore non-JSON error responses.
        }

        if (response.status === 409) {
          throw new Error(
            detail || "A cow with this ID already exists."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        throw new Error(
          detail || `Failed to add cow: ${response.status}`
        );
      }

      const newCow = await response.json();

      setCows((previous) => [
        newCow,
        ...previous,
      ]);

      setForm({
        cow_id: "",
        breed: "",
        parity: "",
        days_in_milk: "",
        notes: "",
      });

      setShowAddModal(false);
    } catch (err) {
      console.error("Add cow error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add cow."
      );
    } finally {
      setAdding(false);
    }
  };

  const removeCow = async (cow: Cow) => {
    const confirmed = window.confirm(
      `Remove ${cow.cow_id} from the active herd?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      /*
       * IMPORTANT:
       * We don't permanently delete prediction history here.
       *
       * Your backend currently exposes:
       * GET /cows
       * POST /cows
       * GET /cows/{cow_id}
       *
       * There is no confirmed DELETE /cows/{cow_id} endpoint yet.
       *
       * Therefore this button currently stops here instead of
       * pretending a DELETE endpoint exists.
       */
      throw new Error(
        "Cow removal is not connected yet. We will add safe deactivation using is_active next."
      );
    } catch (err) {
      console.error("Remove cow error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove cow."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-green-700 to-emerald-500 p-8 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <FaPaw className="text-3xl" />

              <span className="rounded-full bg-white/20 px-4 py-1 text-sm">
                Herd Management
              </span>
            </div>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              My Herd
            </h1>

            <p className="mt-3 max-w-2xl text-green-100">
              Manage your cows, view their information, and monitor
              prediction results from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-bold text-green-700 shadow-lg transition hover:bg-green-50"
          >
            <FaPlus />
            Add Cow
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <FaExclamationTriangle className="mt-1 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by cow ID or breed..."
              className="w-full rounded-xl border-2 border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-green-600"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Cows" },
              { id: "healthy", label: "Healthy" },
              { id: "risk", label: "At Risk" },
              { id: "heat", label: "Heat Stress" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFilter(item.id as FilterType)
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item.id
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Herd Summary */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-gray-500">Total Cows</p>
          <h2 className="mt-2 text-4xl font-extrabold text-green-700">
            {cows.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-gray-500">Active Cows</p>
          <h2 className="mt-2 text-4xl font-extrabold text-blue-700">
            {
              cows.filter(
                (cow) => cow.is_active !== false
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-gray-500">Showing</p>
          <h2 className="mt-2 text-4xl font-extrabold text-purple-700">
            {filteredCows.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-gray-500">Status</p>
          <h2 className="mt-2 text-lg font-bold text-green-700">
            Connected
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Live PostgreSQL data
          </p>
        </div>
      </div>

      {/* Cow List */}
      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Cows
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredCows.length} cow
              {filteredCows.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadCows()}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow hover:bg-green-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />

            <p className="mt-4 text-gray-500">
              Loading your herd...
            </p>
          </div>
        ) : filteredCows.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <FaPaw className="mx-auto text-5xl text-green-200" />

            <h3 className="mt-5 text-2xl font-bold text-gray-800">
              {cows.length === 0
                ? "No cows registered yet"
                : "No cows found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              {cows.length === 0
                ? "Add your first cow to start building your SmartCattleNet herd."
                : "Try changing your search or filter."}
            </p>

            {cows.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
              >
                <FaPlus className="mr-2 inline" />
                Add First Cow
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCows.map((cow) => (
              <div
                key={cow.cow_id}
                className="overflow-hidden rounded-3xl bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                        <FaPaw className="text-2xl" />
                      </div>

                      <div>
                        <h3 className="text-2xl font-extrabold">
                          {cow.cow_id}
                        </h3>

                        <p className="text-sm text-green-100">
                          {cow.breed || "Breed not specified"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                      {cow.is_active === false
                        ? "Inactive"
                        : "Active"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Parity
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-800">
                        {cow.parity ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Days in Milk
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-800">
                        {cow.days_in_milk ?? "—"}
                      </p>
                    </div>
                  </div>

                  {cow.notes && (
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Notes
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                        {cow.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/herd/${encodeURIComponent(
                            cow.cow_id
                          )}`
                        )
                      }
                      className="flex-1 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
                    >
                      View Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => void removeCow(cow)}
                      className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-red-600 transition hover:bg-red-50"
                      title="Remove cow"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Cow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Cow
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Register a cow in your active herd.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cow ID *
                </label>

                <input
                  type="text"
                  value={form.cow_id}
                  onChange={(e) =>
                    handleFormChange(
                      "cow_id",
                      e.target.value
                    )
                  }
                  placeholder="Example: C01"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 uppercase outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Breed *
                </label>

                <input
                  type="text"
                  value={form.breed}
                  onChange={(e) =>
                    handleFormChange(
                      "breed",
                      e.target.value
                    )
                  }
                  placeholder="Example: Holstein"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Parity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.parity}
                    onChange={(e) =>
                      handleFormChange(
                        "parity",
                        e.target.value
                      )
                    }
                    placeholder="Example: 1"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Days in Milk
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.days_in_milk}
                    onChange={(e) =>
                      handleFormChange(
                        "days_in_milk",
                        e.target.value
                      )
                    }
                    placeholder="Example: 100"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    handleFormChange(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Optional notes about this cow..."
                  rows={4}
                  className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                  className="flex-1 rounded-xl border-2 border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void addCow()}
                  disabled={
                    adding ||
                    !form.cow_id.trim() ||
                    !form.breed.trim()
                  }
                  className="flex-1 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Cow"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}




