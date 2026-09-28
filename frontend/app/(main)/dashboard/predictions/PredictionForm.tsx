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

interface FormData {
  cow_id: string;
  lactation_number: number | "";
  days_in_milk: number | "";
  parity: number | "";
  milk_yield: number | "";
  fat_percent: number | "";
  protein_percent: number | "";
  lactose_percent: number | "";
  snf_percent: number | "";
  scc: number | "";
  body_temperature: number | "";
  heart_rate: number | "";
  respiration_rate: number | "";
  feed_intake: number | "";
  water_intake: number | "";
  temperature: number | "";
  humidity: number | "";
  thi: number | "";
  activity_level: number | "";
  rumination: number | "";
}

export default function PredictionForm({
  setResult,
}: PredictionFormProps) {
  const [loading, setLoading] = useState(false);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loadingCows, setLoadingCows] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    cow_id: "",
    lactation_number: "",
    days_in_milk: "",
    parity: "",
    milk_yield: "",
    fat_percent: "",
    protein_percent: "",
    lactose_percent: "",
    snf_percent: "",
    scc: "",
    body_temperature: "",
    heart_rate: "",
    respiration_rate: "",
    feed_intake: "",
    water_intake: "",
    temperature: "",
    humidity: "",
    thi: "",
    activity_level: "",
    rumination: "",
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
        : (response as CowsResponse)?.cows ?? [];

      const activeCows = cowList.filter(
        (cow) => cow.is_active !== false
      );

      setCows(activeCows);

      // Automatically select the first registered active cow
      if (activeCows.length > 0) {
        const firstCow = activeCows[0];

        setFormData((prev) => ({
          ...prev,
          cow_id: firstCow.cow_id,
          parity:
            firstCow.parity !== undefined
              ? firstCow.parity
              : "",
          days_in_milk:
            firstCow.days_in_milk !== undefined
              ? firstCow.days_in_milk
              : "",
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cow_id"
          ? value
          : value === ""
            ? ""
            : Number(value),
    }));
  };

  // ---------------------------------------------------------
  // WHEN USER SELECTS ANOTHER COW
  // ---------------------------------------------------------

  const handleCowChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCowId = e.target.value;

    const selectedCow = cows.find(
      (cow) => cow.cow_id === selectedCowId
    );

    setFormData((prev) => ({
      ...prev,
      cow_id: selectedCowId,
      parity:
        selectedCow?.parity !== undefined
          ? selectedCow.parity
          : "",
      days_in_milk:
        selectedCow?.days_in_milk !== undefined
          ? selectedCow.days_in_milk
          : "",
    }));

    // Clear previous prediction when changing cow
    setResult(null);
  };

  // ---------------------------------------------------------
  // VALIDATE FORM
  // ---------------------------------------------------------

  function validateForm(): boolean {
    if (!formData.cow_id) {
      alert("Please select a registered cow.");
      return false;
    }

    const requiredFields: Array<keyof FormData> = [
      "lactation_number",
      "days_in_milk",
      "parity",
      "milk_yield",
      "fat_percent",
      "protein_percent",
      "lactose_percent",
      "snf_percent",
      "scc",
      "body_temperature",
      "heart_rate",
      "respiration_rate",
      "feed_intake",
      "water_intake",
      "temperature",
      "humidity",
      "thi",
      "activity_level",
      "rumination",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        formData[field] === "" ||
        formData[field] === null ||
        formData[field] === undefined
    );

    if (missingFields.length > 0) {
      alert(
        "Please enter all cattle and environmental measurements before running the prediction."
      );
      return false;
    }

    return true;
  }

  // ---------------------------------------------------------
  // PREDICT
  // ---------------------------------------------------------

  async function handlePredict() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const predictionInput = {
        cow_id: formData.cow_id,
        lactation_number: Number(formData.lactation_number),
        days_in_milk: Number(formData.days_in_milk),
        parity: Number(formData.parity),
        milk_yield: Number(formData.milk_yield),
        fat_percent: Number(formData.fat_percent),
        protein_percent: Number(formData.protein_percent),
        lactose_percent: Number(formData.lactose_percent),
        snf_percent: Number(formData.snf_percent),
        scc: Number(formData.scc),
        body_temperature: Number(formData.body_temperature),
        heart_rate: Number(formData.heart_rate),
        respiration_rate: Number(formData.respiration_rate),
        feed_intake: Number(formData.feed_intake),
        water_intake: Number(formData.water_intake),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        thi: Number(formData.thi),
        activity_level: Number(formData.activity_level),
        rumination: Number(formData.rumination),
      };

      const data = await apiPost(
        "/predict",
        predictionInput
      );

      console.log("Prediction Response:", data);

      setResult(data);
    } catch (error) {
      console.error("Prediction Error:", error);

      alert(
        "Prediction failed. Please check the entered measurements and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // FORM FIELDS
  // ---------------------------------------------------------

  const fields: Array<
    [keyof FormData, string]
  > = [
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
  ];

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-gray-800">
        Cow & Environmental Data
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Enter the actual measurements for the selected registered
        cow. These values are used by the CCP-Chain prediction
        pipeline.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {/* -------------------------------------------------- */}
        {/* COW SELECTOR */}
        {/* -------------------------------------------------- */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Cow ID
          </label>

          <select
            name="cow_id"
            value={formData.cow_id}
            onChange={handleCowChange}
            disabled={
              loadingCows || cows.length === 0
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            {loadingCows ? (
              <option value="">
                Loading cows...
              </option>
            ) : cows.length === 0 ? (
              <option value="">
                No registered cows
              </option>
            ) : (
              cows.map((cow) => (
                <option
                  key={cow.cow_id}
                  value={cow.cow_id}
                >
                  {cow.cow_id}
                  {cow.breed
                    ? ` - ${cow.breed}`
                    : ""}
                </option>
              ))
            )}
          </select>

          {cows.length === 0 && !loadingCows && (
            <p className="mt-2 text-xs text-red-600">
              Register a cow in Herd before running a
              prediction.
            </p>
          )}
        </div>

        {/* -------------------------------------------------- */}
        {/* OTHER FIELDS */}
        {/* -------------------------------------------------- */}

        {fields.map(([name, label]) => (
          <div key={name}>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {label}
            </label>

            <input
              type="number"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              step="any"
              min={
                name === "scc" ||
                name === "heart_rate" ||
                name === "respiration_rate" ||
                name === "activity_level" ||
                name === "rumination" ||
                name === "lactation_number" ||
                name === "days_in_milk" ||
                name === "parity"
                  ? "0"
                  : undefined
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        ))}
      </div>

      {/* -------------------------------------------------- */}
      {/* PREDICT BUTTON */}
      {/* -------------------------------------------------- */}

      <div className="mt-7 flex justify-end">
        <button
          onClick={handlePredict}
          disabled={
            loading ||
            loadingCows ||
            cows.length === 0 ||
            !formData.cow_id
          }
          className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading
            ? "Predicting..."
            : "Generate Prediction"}
        </button>
      </div>
    </div>
  );
}