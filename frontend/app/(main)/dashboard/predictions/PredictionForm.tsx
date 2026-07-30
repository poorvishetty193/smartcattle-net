"use client";

import { useState } from "react";

interface PredictionFormProps {
  setResult: React.Dispatch<React.SetStateAction<any>>;
}

export default function PredictionForm({ setResult }: PredictionFormProps) {
  const [loading, setLoading] = useState(false);

  const [formData] = useState({
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

 async function handlePredict() {
   try {
     setLoading(true);

     const token = localStorage.getItem("token");
     console.log("Token:", token);

     const response = await fetch("http://127.0.0.1:8000/predict", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify(formData),
     });

     console.log("Status:", response.status);

     const data = await response.json();
     console.log("Response:", data);

     if (!response.ok) {
       alert(JSON.stringify(data, null, 2));
       return;
     }

     setResult(data);
   } catch (error) {
     console.error("Prediction Error:", error);
   } finally {
     setLoading(false);
   }
 }
  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <button
        onClick={handlePredict}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Predicting..." : "Predict"}
      </button>
    </div>
  );
}
