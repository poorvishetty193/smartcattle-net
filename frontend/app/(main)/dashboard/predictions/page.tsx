"use client";

import { useState } from "react";
import PredictionForm from "./PredictionForm";
import PredictionCards from "./PredictionCards";
import PredictionHistory from "./PredictionHistory";

export default function PredictionsPage() {
  const [result, setResult] = useState<any>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handlePredictionResult = (data: any) => {
    setResult(data);
    setRefreshHistory((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#f4faf5] px-6 py-8 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Milk Prediction
          </h1>

          <p className="mt-2 text-gray-500">
            Use cattle and environmental data to generate AI-powered milk
            production predictions.
          </p>
        </div>

        {/* Prediction Form */}
        <PredictionForm setResult={handlePredictionResult} />

        {/* Prediction Result */}
        {result && <PredictionCards result={result} />}

        {/* Prediction History */}
        <PredictionHistory refreshKey={refreshHistory} />
      </div>
    </main>
  );
}
