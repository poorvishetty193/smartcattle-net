"use client";

import Image from "next/image";
import Link from "next/link";

import { FaCircle } from "react-icons/fa";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function CowProfilePage() {

  const predictionCards = [
    { title: "Yield Prediction", value: "28.5 L", color: "bg-green-100 text-green-700" },
    { title: "Drop Probability", value: "12%", color: "bg-red-100 text-red-700" },
    { title: "Mastitis Index", value: "Low", color: "bg-yellow-100 text-yellow-700" },
    { title: "Body Temperature", value: "38.5°C", color: "bg-orange-100 text-orange-700" },
    { title: "Rumination", value: "485 Min", color: "bg-blue-100 text-blue-700" },
    { title: "Activity", value: "Normal", color: "bg-cyan-100 text-cyan-700" },
    { title: "Feed Intake", value: "24 Kg", color: "bg-purple-100 text-purple-700" },
    { title: "Model Confidence", value: "97%", color: "bg-indigo-100 text-indigo-700" },
    { title: "BCS Score", value: "3.5", color: "bg-pink-100 text-pink-700" },
    { title: "Reproductive Status", value: "Healthy", color: "bg-lime-100 text-lime-700" },
    { title: "SCC Estimate", value: "148K", color: "bg-emerald-100 text-emerald-700" },
    { title: "Water Intake", value: "68 L", color: "bg-sky-100 text-sky-700" },
  ];

  const lactationData = [
    { month: "Jan", milk: 18 },
    { month: "Feb", milk: 21 },
    { month: "Mar", milk: 25 },
    { month: "Apr", milk: 29 },
    { month: "May", milk: 31 },
    { month: "Jun", milk: 28 },
  ];

  const shapData = [
    { feature: "Feed Intake", value: 72 },
    { feature: "Rumination", value: 48 },
    { feature: "Stress Level", value: -30 },
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-6">
       {/* Cow Profile */}

<div className="bg-white rounded-xl shadow-md p-6">

  <div className="flex flex-col md:flex-row items-center gap-8">

    <Image
      src="/cow.png"
      alt="Cow"
      width={150}
      height={150}
      className="rounded-xl border-2 border-gray-200"
    />

    <div className="flex-1">

      <h1 className="text-3xl font-bold text-gray-800">
        Cow ID : C-007
      </h1>

      <div className="flex items-center gap-2 mt-3">

        <FaCircle className="text-red-500 text-xs" />

        <span className="text-red-600 font-semibold">
          High Risk
        </span>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">

        <div>
          <p className="text-sm text-gray-500">
            Breed
          </p>
          <h3 className="font-bold text-lg">
            Holstein Friesian
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Parity
          </p>
          <h3 className="font-bold text-lg">
            3
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            DIM
          </p>
          <h3 className="font-bold text-lg">
            142
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Status
          </p>
          <h3 className="font-bold text-lg text-green-600">
            Lactating
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Age
          </p>
          <h3 className="font-bold text-lg">
            5 Years
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Weight
          </p>
          <h3 className="font-bold text-lg">
            640 Kg
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Lactation
          </p>
          <h3 className="font-bold text-lg">
            3rd Cycle
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Last Milking
          </p>
          <h3 className="font-bold text-lg">
            28.5 L
          </h3>
        </div>

      </div>

    </div>

  </div>

</div>
{/* Prediction Cards */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">

  {predictionCards.map((card, index) => (

    <div
      key={index}
      className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-all duration-300 p-5"
    >

      <p className="text-sm text-gray-500 font-medium">
        {card.title}
      </p>

      <div
        className={`mt-4 rounded-lg py-6 text-center text-2xl font-bold ${card.color}`}
      >
        {card.value}
      </div>

    </div>

  ))}

</div>

{/* Lactation Curve Analysis */}

<div className="bg-white rounded-xl shadow-md p-6 mt-8">

  <h2 className="text-2xl font-bold mb-6">
    Lactation Curve Analysis
  </h2>

  <ResponsiveContainer width="100%" height={320}>

    <LineChart data={lactationData}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="month" />

      <YAxis />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="milk"
        stroke="#2563eb"
        strokeWidth={3}
        dot={{ r: 5 }}
        activeDot={{ r: 8 }}
      />

    </LineChart>

  </ResponsiveContainer>

  <div className="grid grid-cols-3 gap-4 mt-6">

    <div className="bg-blue-50 rounded-lg p-4 text-center">
      <p className="text-gray-500 text-sm">
        Peak Yield
      </p>
      <h3 className="text-xl font-bold text-blue-600">
        31 L
      </h3>
    </div>

    <div className="bg-green-50 rounded-lg p-4 text-center">
      <p className="text-gray-500 text-sm">
        Average Yield
      </p>
      <h3 className="text-xl font-bold text-green-600">
        25.3 L
      </h3>
    </div>

    <div className="bg-purple-50 rounded-lg p-4 text-center">
      <p className="text-gray-500 text-sm">
        Lactation Stage
      </p>
      <h3 className="text-xl font-bold text-purple-600">
        Mid
      </h3>
    </div>

  </div>

</div>


{/* SHAP Driver Analysis */}

<div className="bg-white rounded-xl shadow-md p-6 mt-8">

  <div className="flex justify-between items-center mb-6">

    <div>
      <h2 className="text-2xl font-bold">
        SHAP Driver Analysis
      </h2>

      <p className="text-gray-500 text-sm">
        Feature contribution to AI prediction
      </p>
    </div>

    <div className="flex gap-6">

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-red-600 text-sm font-semibold">
          Negative
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-green-600 text-sm font-semibold">
          Positive
        </span>
      </div>

    </div>

  </div>

  <div className="space-y-8">

    {shapData.map((item, index) => (

      <div key={index}>

        <div className="flex justify-between mb-2">

          <span className="font-semibold">
            {item.feature}
          </span>

          <span
            className={`font-bold ${
              item.value >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {item.value >= 0 ? "+" : ""}
            {item.value}
          </span>

        </div>

        <div className="relative h-7 bg-gray-200 rounded-full overflow-hidden">

          {/* Center Line */}

          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-500 z-10"></div>

          {item.value >= 0 ? (

            <div
              className="absolute left-1/2 top-0 h-full bg-green-500 rounded-r-full"
              style={{
                width: `${item.value/2}px`,
              }}
            />

          ) : (

            <div
              className="absolute right-1/2 top-0 h-full bg-red-500 rounded-l-full"
              style={{
                width: `${Math.abs(item.value/2)}px`,
              }}
            />

          )}

        </div>

      </div>

    ))}

  </div>

  <div className="flex justify-between mt-6 text-sm text-gray-500 font-semibold">

    <span>Negative Impact</span>

    <span>0</span>

    <span>Positive Impact</span>

  </div>

</div>

{/* Farm Decision */}

<div className="bg-white rounded-xl shadow-md p-6 mt-8">

  <h2 className="text-2xl font-bold mb-6">
    Farm Decision
  </h2>

  <div className="bg-green-50 border border-green-300 rounded-xl p-6">

    <h3 className="text-xl font-bold text-green-700">
      AI Recommendation
    </h3>

    <p className="mt-4 text-gray-700 leading-7">
      Continue the current feeding schedule. Increase water intake monitoring
      and observe rumination over the next 24 hours. The AI predicts stable
      milk production with a low probability of disease.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

      <div className="bg-white rounded-lg shadow p-5 text-center">

        <p className="text-gray-500 text-sm">
          Expected Yield
        </p>

        <h3 className="text-3xl font-bold text-green-600 mt-2">
          28.5 L
        </h3>

      </div>

      <div className="bg-white rounded-lg shadow p-5 text-center">

        <p className="text-gray-500 text-sm">
          Health Status
        </p>

        <h3 className="text-3xl font-bold text-blue-600 mt-2">
          Healthy
        </h3>

      </div>

      <div className="bg-white rounded-lg shadow p-5 text-center">

        <p className="text-gray-500 text-sm">
          AI Confidence
        </p>

        <h3 className="text-3xl font-bold text-purple-600 mt-2">
          97%
        </h3>

      </div>

    </div>

    <div className="mt-8 border-t pt-6">

      <h4 className="font-bold text-lg mb-4">
        Recommended Actions
      </h4>

      <ul className="space-y-3 text-gray-700">

        <li>✅ Maintain current feed intake (24 Kg/day)</li>

        <li>✅ Monitor body temperature every 6 hours</li>

        <li>✅ Ensure clean drinking water availability (68 L/day)</li>

        <li>✅ Observe rumination activity for early disease detection</li>

        <li>✅ Schedule the next veterinary inspection within 7 days</li>

      </ul>

    </div>

  </div>

</div>

{/* Quick Navigation */}

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">

  <Link
    href="/herd/C-007/health"
    className="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-semibold transition"
  >
    🩺 Health
  </Link>


  <Link
    href="/herd/C-007/history"
    className="bg-orange-600 hover:bg-orange-700 text-white text-center py-4 rounded-xl font-semibold transition"
  >
    📜 History
  </Link>

  <Link
    href="/herd/C-007/prediction"
    className="bg-purple-600 hover:bg-purple-700 text-white text-center py-4 rounded-xl font-semibold transition"
  >
    🤖 Prediction
  </Link>

  <Link
    href="/herd/C-007/reports"
    className="bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl font-semibold transition"
  >
    📄 Reports
  </Link>

  <Link
    href="/herd/C-007/twin"
    className="bg-cyan-600 hover:bg-cyan-700 text-white text-center py-4 rounded-xl font-semibold transition"
  >
    🐄 Digital Twin
  </Link>

</div>

      
      </div>

    </main>

  );

}


        
  