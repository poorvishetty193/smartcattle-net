"use client";

import { useState } from "react";
import PredictionForm from "./PredictionForm";
import PredictionCards from "./PredictionCards";
import PredictionHistory from "./PredictionHistory";

export default function PredictionsPage() {
  const [result, setResult] = useState(null);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">AI Milk Prediction</h1>

      <PredictionForm setResult={setResult} />

      {result && <PredictionCards result={result} />}
      <PredictionHistory />
    </div>
  );
}
