"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

interface PredictionFormProps {
  setResult: React.Dispatch<React.SetStateAction<any>>;
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "cow_id" ? value : Number(value),
    }));
  }

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

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-xl font-bold mb-6">Enter Cow Data</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cow ID</label>

          <input
            name="cow_id"
            value={formData.cow_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Lactation Number
          </label>

          <input
            type="number"
            name="lactation_number"
            value={formData.lactation_number}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Days in Milk</label>

          <input
            type="number"
            name="days_in_milk"
            value={formData.days_in_milk}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Parity</label>

          <input
            type="number"
            name="parity"
            value={formData.parity}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Milk Yield</label>

          <input
            type="number"
            step="0.1"
            name="milk_yield"
            value={formData.milk_yield}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fat %</label>

          <input
            type="number"
            step="0.1"
            name="fat_percent"
            value={formData.fat_percent}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Protein %</label>

          <input
            type="number"
            step="0.1"
            name="protein_percent"
            value={formData.protein_percent}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lactose %</label>

          <input
            type="number"
            step="0.1"
            name="lactose_percent"
            value={formData.lactose_percent}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SNF %</label>

          <input
            type="number"
            step="0.1"
            name="snf_percent"
            value={formData.snf_percent}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SCC</label>

          <input
            type="number"
            name="scc"
            value={formData.scc}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Body Temperature
          </label>

          <input
            type="number"
            step="0.1"
            name="body_temperature"
            value={formData.body_temperature}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Heart Rate</label>

          <input
            type="number"
            name="heart_rate"
            value={formData.heart_rate}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Respiration Rate
          </label>

          <input
            type="number"
            name="respiration_rate"
            value={formData.respiration_rate}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Feed Intake</label>

          <input
            type="number"
            step="0.1"
            name="feed_intake"
            value={formData.feed_intake}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Water Intake</label>

          <input
            type="number"
            name="water_intake"
            value={formData.water_intake}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Temperature</label>

          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Humidity</label>

          <input
            type="number"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">THI</label>

          <input
            type="number"
            name="thi"
            value={formData.thi}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Activity Level
          </label>

          <input
            type="number"
            name="activity_level"
            value={formData.activity_level}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rumination</label>

          <input
            type="number"
            name="rumination"
            value={formData.rumination}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold"
      >
        {loading ? "Predicting..." : "Predict"}
      </button>
    </div>
  );
}
