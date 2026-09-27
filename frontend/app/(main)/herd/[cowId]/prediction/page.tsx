"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaChartBar,
  FaHeartbeat,
  FaExclamationTriangle,
  FaTint,
  FaRobot,
  FaThermometerHalf,
  FaWind,
  FaWater,
  FaBrain,
} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Cow = {
  cow_id: string;
  breed?: string | null;
  parity?: number | null;
  days_in_milk?: number | null;
  notes?: string | null;
  is_active?: boolean;
};

type PredictionForm = {
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
};

type PredictionResult = {
  stage1_daily_yield?: number | null;

  stage2_drop_prob?: number | null;
  stage2_drop_flag?: number | null;

  stage3_next_milking?: number | null;

  stage4_msi?: number | null;

  stage5_quantity?: number | null;

  stage6_forecast_mean?: number | null;
  stage6_trend_slope?: number | null;
  stage6_trend_dir?: number | null;

  stage7_productivity?: number | null;

  stage8_stress_prob?: number | null;
  stage8_stress_flag?: number | null;

  stage9_decision?: string | null;
  stage9_attention?: number | null;

  stage10_priority_score?: number | null;
  stage10_priority_rank?: number | null;

  stage11_health_score?: number | null;

  stage12_risk_score?: number | null;
  stage12_risk_flag?: number | null;
  stage12_risk_level?: string | null;

  raw_response?: unknown;
};

function formatNumber(value: number | null | undefined, decimals = 1) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return Number(value).toFixed(decimals);
}

function formatProbability(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  const number = Number(value);

  // Backend probabilities are 0-1.
  return `${(number * 100).toFixed(1)}%`;
}

function getTrendLabel(direction: number | null | undefined) {
  if (direction === 1) return "Increasing";
  if (direction === -1) return "Decreasing";
  if (direction === 0) return "Stable";

  return "—";
}

function getRiskStyle(risk: string | null | undefined) {
  const value = risk?.toLowerCase() || "";

  if (value.includes("high")) {
    return "bg-red-100 text-red-700";
  }

  if (value.includes("medium")) {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-green-100 text-green-700";
}

export default function PredictionPage() {
  const params = useParams();

  const cowId = Array.isArray(params?.cowId) ? params.cowId[0] : params?.cowId;

  const [cow, setCow] = useState<Cow | null>(null);

  const [loadingCow, setLoadingCow] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [result, setResult] = useState<PredictionResult | null>(null);

  const [formData, setFormData] = useState<PredictionForm>({
    cow_id: cowId || "",
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

  /*
   * ----------------------------------------------------------
   * LOAD COW
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!cowId) return;

    async function loadCow() {
      try {
        setLoadingCow(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const response = await fetch(
          `${API_URL}/cows/${encodeURIComponent(cowId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Your session has expired. Please log in again.");
          }

          if (response.status === 404) {
            throw new Error("Cow not found.");
          }

          throw new Error("Unable to load cow information.");
        }

        const data: Cow = await response.json();

        setCow(data);

        /*
         * Use actual cow values for fields already stored
         * in the Cow table.
         */
        setFormData((previous) => ({
          ...previous,
          cow_id: data.cow_id,
          parity:
            data.parity !== null && data.parity !== undefined
              ? data.parity
              : "",
          days_in_milk:
            data.days_in_milk !== null && data.days_in_milk !== undefined
              ? data.days_in_milk
              : "",
        }));
      } catch (err) {
        console.error("Cow loading error:", err);

        setError(err instanceof Error ? err.message : "Unable to load cow.");
      } finally {
        setLoadingCow(false);
      }
    }

    loadCow();
  }, [cowId]);

  /*
   * ----------------------------------------------------------
   * FORM FIELDS
   * ----------------------------------------------------------
   */

  const fields = useMemo(
    () => [
      {
        name: "lactation_number",
        label: "Lactation Number",
        step: "1",
      },
      {
        name: "days_in_milk",
        label: "Days in Milk",
        step: "1",
      },
      {
        name: "parity",
        label: "Parity",
        step: "1",
      },
      {
        name: "milk_yield",
        label: "Milk Yield (L)",
        step: "0.1",
      },
      {
        name: "fat_percent",
        label: "Fat (%)",
        step: "0.1",
      },
      {
        name: "protein_percent",
        label: "Protein (%)",
        step: "0.1",
      },
      {
        name: "lactose_percent",
        label: "Lactose (%)",
        step: "0.1",
      },
      {
        name: "snf_percent",
        label: "SNF (%)",
        step: "0.1",
      },
      {
        name: "scc",
        label: "SCC",
        step: "1",
      },
      {
        name: "body_temperature",
        label: "Body Temperature (°C)",
        step: "0.1",
      },
      {
        name: "heart_rate",
        label: "Heart Rate",
        step: "1",
      },
      {
        name: "respiration_rate",
        label: "Respiration Rate",
        step: "1",
      },
      {
        name: "feed_intake",
        label: "Feed Intake (kg)",
        step: "0.1",
      },
      {
        name: "water_intake",
        label: "Water Intake (L)",
        step: "0.1",
      },
      {
        name: "temperature",
        label: "Environmental Temperature (°C)",
        step: "0.1",
      },
      {
        name: "humidity",
        label: "Humidity (%)",
        step: "0.1",
      },
      {
        name: "thi",
        label: "THI",
        step: "0.1",
      },
      {
        name: "activity_level",
        label: "Activity Level",
        step: "0.1",
      },
      {
        name: "rumination",
        label: "Rumination",
        step: "0.1",
      },
    ],
    [],
  );

  /*
   * ----------------------------------------------------------
   * HANDLE INPUT
   * ----------------------------------------------------------
   */

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "cow_id" ? value : value === "" ? "" : Number(value),
    }));
  }

  /*
   * ----------------------------------------------------------
   * VALIDATION
   * ----------------------------------------------------------
   */

  function validateForm() {
    const requiredFields: Array<keyof PredictionForm> = [
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

    for (const field of requiredFields) {
      if (
        formData[field] === "" ||
        formData[field] === null ||
        formData[field] === undefined
      ) {
        return false;
      }
    }

    return true;
  }

  /*
   * ----------------------------------------------------------
   * RUN PREDICTION
   * ----------------------------------------------------------
   */

  async function handlePredict() {
    setError("");
    setSuccess("");

    if (!cowId) {
      setError("Cow ID is missing.");
      return;
    }

    if (!validateForm()) {
      setError(
        "Please fill in all cow and environmental measurements before running the prediction.",
      );
      return;
    }

    try {
      setLoadingPrediction(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      /*
       * Convert the controlled form values into the exact
       * payload expected by POST /predict.
       */
      const payload = {
        cow_id: String(formData.cow_id),
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

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Prediction failed. Please check the entered values.",
        );
      }

      const data: PredictionResult = await response.json();

      console.log("Prediction response:", data);

      setResult(data);

      setSuccess(`Prediction completed successfully for ${cowId}.`);

      /*
       * Scroll to results after prediction.
       */
      setTimeout(() => {
        document.getElementById("prediction-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      console.error("Prediction error:", err);

      setError(err instanceof Error ? err.message : "Prediction failed.");
    } finally {
      setLoadingPrediction(false);
    }
  }

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (loadingCow) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8">
            <p className="text-gray-500">Loading cow information...</p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * COW NOT FOUND
   * ----------------------------------------------------------
   */

  if (!cow) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8">
            <h1 className="text-2xl font-bold text-gray-800">Cow not found</h1>

            <p className="text-gray-500 mt-2">
              {error || `Unable to find cow ${cowId}.`}
            </p>

            <Link
              href="/herd"
              className="inline-flex items-center gap-2 mt-6 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold"
            >
              <FaArrowLeft />
              Back to Herd
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * RESULT CARDS
   * ----------------------------------------------------------
   */

  const resultCards = result
    ? [
        {
          title: "Milk Yield",
          value:
            result.stage1_daily_yield !== null &&
            result.stage1_daily_yield !== undefined
              ? `${formatNumber(result.stage1_daily_yield)} L`
              : "—",
          color: "bg-green-100 text-green-700",
          icon: <FaChartBar />,
        },
        {
          title: "Milk Drop Probability",
          value: formatProbability(result.stage2_drop_prob),
          color: "bg-red-100 text-red-700",
          icon: <FaExclamationTriangle />,
        },
        {
          title: "Next Milking",
          value:
            result.stage3_next_milking !== null &&
            result.stage3_next_milking !== undefined
              ? `${formatNumber(result.stage3_next_milking)} L`
              : "—",
          color: "bg-blue-100 text-blue-700",
          icon: <FaTint />,
        },
        {
          title: "Milk Stability Index",
          value: formatNumber(result.stage4_msi),
          color: "bg-yellow-100 text-yellow-700",
          icon: <FaChartBar />,
        },
        {
          title: "Milk Quantity",
          value:
            result.stage5_quantity !== null &&
            result.stage5_quantity !== undefined
              ? `${formatNumber(result.stage5_quantity)} L`
              : "—",
          color: "bg-cyan-100 text-cyan-700",
          icon: <FaTint />,
        },
        {
          title: "7-Day Forecast Mean",
          value:
            result.stage6_forecast_mean !== null &&
            result.stage6_forecast_mean !== undefined
              ? `${formatNumber(result.stage6_forecast_mean)} L`
              : "—",
          color: "bg-indigo-100 text-indigo-700",
          icon: <FaChartBar />,
        },
        {
          title: "Productivity Score",
          value: formatNumber(result.stage7_productivity),
          color: "bg-purple-100 text-purple-700",
          icon: <FaRobot />,
        },
        {
          title: "Stress Probability",
          value: formatProbability(result.stage8_stress_prob),
          color: "bg-orange-100 text-orange-700",
          icon: <FaThermometerHalf />,
        },
        {
          title: "Priority Score",
          value: formatNumber(result.stage10_priority_score),
          color: "bg-pink-100 text-pink-700",
          icon: <FaExclamationTriangle />,
        },
        {
          title: "Health Score",
          value: formatNumber(result.stage11_health_score),
          color: "bg-emerald-100 text-emerald-700",
          icon: <FaHeartbeat />,
        },
        {
          title: "Risk Score",
          value: formatNumber(result.stage12_risk_score),
          color: "bg-red-100 text-red-700",
          icon: <FaExclamationTriangle />,
        },
        {
          title: "Risk Level",
          value: result.stage12_risk_level
            ? result.stage12_risk_level
                .replaceAll("_", " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())
            : "—",
          color: getRiskStyle(result.stage12_risk_level),
          icon: <FaHeartbeat />,
        },
      ]
    : [];

  /*
   * ----------------------------------------------------------
   * PAGE
   * ----------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <Link
            href={`/herd/${encodeURIComponent(cow.cow_id)}`}
            className="flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
          >
            <FaArrowLeft />
            Back to {cow.cow_id}
          </Link>

          <div className="text-left md:text-right">
            <h1 className="text-3xl font-bold text-gray-800">
              AI Prediction Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Cow ID:{" "}
              <span className="font-semibold text-gray-700">{cow.cow_id}</span>
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-700 rounded-xl p-4">
            <div className="font-semibold">Prediction Error</div>

            <p className="mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-700 rounded-xl p-4">
            <div className="font-semibold">Success</div>

            <p className="mt-1">{success}</p>
          </div>
        )}

        {/* Cow Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Cow ID</p>

              <p className="text-xl font-bold text-gray-800">{cow.cow_id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Breed</p>

              <p className="text-xl font-bold text-gray-800">
                {cow.breed || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Parity</p>

              <p className="text-xl font-bold text-gray-800">
                {cow.parity ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Days in Milk</p>

              <p className="text-xl font-bold text-gray-800">
                {cow.days_in_milk ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>

              <p
                className={`text-xl font-bold ${
                  cow.is_active === false ? "text-red-600" : "text-green-600"
                }`}
              >
                {cow.is_active === false ? "Inactive" : "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaBrain className="text-green-700 text-2xl" />

            <h2 className="text-2xl font-bold text-gray-800">
              Cow & Environmental Data
            </h2>
          </div>

          <p className="text-gray-500 mb-7">
            Enter the current measurements for <strong>{cow.cow_id}</strong>.
            These values will be sent to the 12-stage prediction pipeline.
          </p>

          {/* Cow ID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cow ID
            </label>

            <input
              type="text"
              value={formData.cow_id}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>

                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name as keyof PredictionForm]}
                  onChange={handleChange}
                  step={field.step}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            ))}
          </div>

          {/* Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handlePredict}
              disabled={loadingPrediction}
              className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition flex items-center gap-3"
            >
              <FaRobot />

              {loadingPrediction
                ? "Running 12-Stage Prediction..."
                : "Run AI Prediction"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <section id="prediction-results" className="mt-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  12-Stage Prediction Results
                </h2>

                <p className="text-gray-500 mt-1">
                  Latest prediction generated for <strong>{cow.cow_id}</strong>
                </p>
              </div>

              {/* Result Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {resultCards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-600 font-semibold">
                        {card.title}
                      </h3>

                      <div className="text-green-700 text-xl">{card.icon}</div>
                    </div>

                    <div
                      className={`mt-5 p-5 rounded-lg text-center text-2xl font-bold ${card.color}`}
                    >
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Details */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Stage Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stage 1 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Stage 1 — Daily Yield</p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage1_daily_yield)} L
                  </p>
                </div>

                {/* Stage 2 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Stage 2 — Milk Drop</p>

                  <p className="text-xl font-bold mt-1">
                    {formatProbability(result.stage2_drop_prob)}
                  </p>

                  <p className="text-sm mt-1">
                    Flag:{" "}
                    <strong>
                      {result.stage2_drop_flag === 1 ? "Alert" : "Normal"}
                    </strong>
                  </p>
                </div>

                {/* Stage 3 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 3 — Next Milking
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage3_next_milking)} L
                  </p>
                </div>

                {/* Stage 4 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 4 — Milk Stability Index
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage4_msi)}
                  </p>
                </div>

                {/* Stage 5 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 5 — Milk Quantity
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage5_quantity)} L
                  </p>
                </div>

                {/* Stage 6 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 6 — Milk Forecast
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage6_forecast_mean)} L
                  </p>

                  <p className="text-sm mt-1">
                    Trend:{" "}
                    <strong>{getTrendLabel(result.stage6_trend_dir)}</strong>
                  </p>

                  <p className="text-sm mt-1">
                    Slope:{" "}
                    <strong>
                      {formatNumber(result.stage6_trend_slope, 4)}
                    </strong>
                  </p>
                </div>

                {/* Stage 7 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 7 — Productivity
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage7_productivity)}
                  </p>
                </div>

                {/* Stage 8 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Stage 8 — Stress</p>

                  <p className="text-xl font-bold mt-1">
                    {formatProbability(result.stage8_stress_prob)}
                  </p>

                  <p className="text-sm mt-1">
                    Flag:{" "}
                    <strong>
                      {result.stage8_stress_flag === 1
                        ? "Stress detected"
                        : "Normal"}
                    </strong>
                  </p>
                </div>

                {/* Stage 9 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 9 — Farm Decision
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {result.stage9_decision || "—"}
                  </p>

                  <p className="text-sm mt-1">
                    Attention:{" "}
                    <strong>
                      {result.stage9_attention === 1
                        ? "Required"
                        : "Not required"}
                    </strong>
                  </p>
                </div>

                {/* Stage 10 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Stage 10 — Priority</p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage10_priority_score)}
                  </p>

                  <p className="text-sm mt-1">
                    Rank: <strong>{result.stage10_priority_rank ?? "—"}</strong>
                  </p>
                </div>

                {/* Stage 11 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Stage 11 — Health Score
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatNumber(result.stage11_health_score)}
                  </p>
                </div>

                {/* Stage 12 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Stage 12 — Early Risk</p>

                  <p
                    className={`inline-block mt-2 px-4 py-2 rounded-full font-bold ${getRiskStyle(
                      result.stage12_risk_level,
                    )}`}
                  >
                    {result.stage12_risk_level || "—"}
                  </p>

                  <p className="text-sm mt-2">
                    Risk Score:{" "}
                    <strong>{formatNumber(result.stage12_risk_score)}</strong>
                  </p>

                  <p className="text-sm mt-1">
                    Anomaly Flag:{" "}
                    <strong>
                      {result.stage12_risk_flag === 1 ? "Detected" : "Normal"}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-8">
              <div className="flex items-center gap-3 mb-5">
                <FaRobot className="text-green-700 text-2xl" />

                <h2 className="text-2xl font-bold text-gray-800">
                  AI Farm Decision
                </h2>
              </div>

              <div className="bg-green-50 border border-green-300 rounded-xl p-6">
                <p className="text-lg text-gray-700">
                  {result.stage9_decision || "No farm decision was returned."}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Link
                href={`/herd/${encodeURIComponent(cow.cow_id)}`}
                className="bg-green-700 hover:bg-green-800 text-white text-center py-3 rounded-lg font-semibold"
              >
                Cow Profile
              </Link>

              <Link
                href={`/herd/${encodeURIComponent(cow.cow_id)}/health`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                Health
              </Link>

              <Link
                href={`/herd/${encodeURIComponent(cow.cow_id)}/history`}
                className="bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                History
              </Link>

              <Link
                href={`/herd/${encodeURIComponent(cow.cow_id)}/reports`}
                className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                Reports
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
