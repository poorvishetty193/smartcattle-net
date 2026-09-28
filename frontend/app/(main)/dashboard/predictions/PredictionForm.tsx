"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface PredictionFormProps {
  setResult: (data: any) => void;
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

export default function PredictionForm({ setResult }: PredictionFormProps) {
  const [loading, setLoading] = useState(false);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loadingCows, setLoadingCows] = useState(true);

  const [formData, setFormData] = useState({
    cow_id: "",
    lactation_number: 2,
    days_in_milk: 120,
    parity: 2,
    milk_yield: 28.5,
    fat_percent: 3.8,
    protein_percent: 3.3,
    lactose_percent: 4.8,
    snf_percent: 8.7,
    scc: 120000,
    body_temperature: 38.6,
    heart_rate: 68,
    respiration_rate: 28,
    feed_intake: 22.5,
    water_intake: 75,
    temperature: 29,
    humidity: 70,
    thi: 76,
    activity_level: 82,
    rumination: 510,
  });

  // ---------------------------------------------------------
  // LOAD CURRENT USER'S ACTIVE COWS
  // ---------------------------------------------------------

  useEffect(() => {
    loadCows();
  }, []);

  async function loadCows() {
    try {
      setLoadingCows(true);

      const response = await apiGet("/cows");

      const cowList: Cow[] = Array.isArray(response)
        ? response
        : ((response as CowsResponse)?.cows ?? []);

      const activeCows = cowList.filter((cow) => cow.is_active !== false);

      setCows(activeCows);

      // Automatically select the first registered cow
      if (activeCows.length > 0) {
        const firstCow = activeCows[0];

        setFormData((prev) => ({
          ...prev,
          cow_id: firstCow.cow_id,
          parity: firstCow.parity ?? prev.parity,
          days_in_milk: firstCow.days_in_milk ?? prev.days_in_milk,
        }));
      }
    } catch (error) {
      console.error("Failed to load cows:", error);
      setCows([]);
    } finally {
      setLoadingCows(false);
    }
  }

  // ---------------------------------------------------------
  // HANDLE INPUT CHANGES
  // ---------------------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "cow_id" ? value : Number(value),
    }));
  };

  // ---------------------------------------------------------
  // PREDICT
  // ---------------------------------------------------------

  async function handlePredict() {
    if (!formData.cow_id) {
      alert("Please select a cow first.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost("/predict", formData);

      console.log("Prediction Response:", data);

      setResult(data);
    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // FORM FIELDS
  // ---------------------------------------------------------

  const fields = [
    ["lactation_number", "Lactation Number"],
    ["days_in_milk", "Days in Milk"],
    ["parity", "Parity"],
    ["milk_yield", "Milk Yield (L)"],
    ["fat_percent", "Fat (%)"],
    ["protein_percent", "Protein (%)"],
    ["lactose_percent", "Lactose (%)"],
    ["snf_percent", "SNF (%)"],
    ["scc", "SCC"],
    ["body_temperature", "Body Temperature (°C)"],
    ["heart_rate", "Heart Rate"],
    ["respiration_rate", "Respiration Rate"],
    ["feed_intake", "Feed Intake (kg)"],
    ["water_intake", "Water Intake (L)"],
    ["temperature", "Temperature (°C)"],
    ["humidity", "Humidity (%)"],
    ["thi", "THI"],
    ["activity_level", "Activity Level"],
    ["rumination", "Rumination"],
  ] as const;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Cow & Environmental Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* COW SELECTOR */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cow ID
          </label>

          <select
            name="cow_id"
            value={formData.cow_id}
            onChange={handleChange}
            disabled={loadingCows || cows.length === 0}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 bg-white"
          >
            {loadingCows ? (
              <option value="">Loading cows...</option>
            ) : cows.length === 0 ? (
              <option value="">No registered cows</option>
            ) : (
              cows.map((cow) => (
                <option key={cow.cow_id} value={cow.cow_id}>
                  {cow.cow_id}
                  {cow.breed ? ` - ${cow.breed}` : ""}
                </option>
              ))
            )}
          </select>
        </div>

        {/* OTHER FIELDS */}

        {fields.map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>

            <input
              type="number"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              step="any"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        ))}
      </div>

      {/* PREDICT BUTTON */}

      <div className="mt-7 flex justify-end">
        <button
          onClick={handlePredict}
          disabled={
            loading || loadingCows || cows.length === 0 || !formData.cow_id
          }
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>
    </div>
  );
}
