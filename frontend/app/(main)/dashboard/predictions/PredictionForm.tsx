"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

interface PredictionFormProps {
  setResult: (data: any) => void;
}

export default function PredictionForm({ setResult }: PredictionFormProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cow_id: "C04",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "cow_id" ? value : Number(value),
    }));
  };

  async function handlePredict() {
    try {
      setLoading(true);

      const data = await apiPost("/predict", formData);

      console.log("Prediction Response:", data);

      setResult(data);
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    ["cow_id", "Cow ID"],
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Cow & Environmental Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>

            <input
              type={name === "cow_id" ? "text" : "number"}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              step="any"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        ))}
      </div>

      <div className="mt-7 flex justify-end">
        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>
    </div>
  );
}
