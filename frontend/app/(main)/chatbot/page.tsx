"use client";

import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaHeartbeat,
  FaTint,
  FaLeaf,
  FaPaw,
  FaBrain,
  FaBell,
  FaShieldAlt,
  FaChartLine,
  FaArrowUp,
} from "react-icons/fa";

export default function AdvisorPage() {
  const [message, setMessage] = useState("");

  const chats = [
    {
      type: "bot",
      text: "Hello! I'm SmartCattle AI Advisor. I can help you monitor cattle health, predict diseases, improve milk production and provide farm recommendations.",
    },
    {
      type: "user",
      text: "Why did Cow C-007 produce less milk today?",
    },
    {
      type: "bot",
      text: "AI analysis shows reduced feed intake, high body temperature and heat stress are the primary causes.",
    },
  ];

  const summaryCards = [
    {
      title: "AI Health Score",
      value: "94%",
      icon: <FaShieldAlt />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Predictions Today",
      value: "126",
      icon: <FaBrain />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Critical Alerts",
      value: "3",
      icon: <FaBell />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "AI Accuracy",
      value: "97.8%",
      icon: <FaChartLine />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-700 via-green-600 to-teal-500 shadow-2xl">

          <div className="p-10">

            <div className="flex flex-col lg:flex-row justify-between items-center gap-10">

              <div>

                <div className="inline-flex items-center gap-3 rounded-full bg-white/20 px-5 py-2 text-white font-semibold">

                  <FaRobot />

                  AI Powered Livestock Intelligence

                </div>

                <h1 className="mt-6 text-5xl font-extrabold text-white">

                  SmartCattle AI Advisor

                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-green-100">

                  Monitor cattle health, detect diseases early,
                  improve milk production and receive intelligent
                  recommendations powered by Artificial Intelligence.

                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <div className="rounded-2xl bg-white/15 px-6 py-4 text-white backdrop-blur">

                    <p className="text-green-100">
                      Herd Monitored
                    </p>

                    <h2 className="text-3xl font-bold">
                      86
                    </h2>

                  </div>

                  <div className="rounded-2xl bg-white/15 px-6 py-4 text-white backdrop-blur">

                    <p className="text-green-100">
                      Active Sensors
                    </p>

                    <h2 className="text-3xl font-bold">
                      248
                    </h2>

                  </div>

                  <div className="rounded-2xl bg-white/15 px-6 py-4 text-white backdrop-blur">

                    <p className="text-green-100">
                      AI Accuracy
                    </p>

                    <h2 className="text-3xl font-bold">
                      97.8%
                    </h2>

                  </div>

                </div>

              </div>

              <div className="w-80 rounded-3xl bg-white/15 p-8 text-center text-white backdrop-blur-xl">

                <p className="text-green-100">

                  Overall Farm Health

                </p>

                <h2 className="mt-4 text-7xl font-extrabold">

                  94%

                </h2>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2">

                  <FaArrowUp />

                  Healthy

                </div>

                <p className="mt-6 text-green-100">

                  Last Updated

                </p>

                <p className="font-semibold">

                  2 minutes ago

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================= SUMMARY CARDS ================= */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {summaryCards.map((card, index) => (

            <div
              key={index}
              className={`${card.bg} rounded-3xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-gray-500">

                    {card.title}

                  </p>

                  <h2 className={`mt-3 text-4xl font-bold ${card.color}`}>

                    {card.value}

                  </h2>

                </div>

                <div className={`rounded-2xl bg-white p-5 text-4xl ${card.color}`}>

                  {card.icon}

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* PART 2 STARTS BELOW */}

        {/* ================= MAIN LAYOUT ================= */}

<div className="mt-10 grid grid-cols-1 xl:grid-cols-4 gap-8">

  {/* LEFT SECTION */}

  <div className="xl:col-span-3 space-y-8">

    {/* AI CHAT */}

    <div className="rounded-3xl bg-white shadow-xl">

      <div className="border-b p-6">

        <h2 className="flex items-center gap-3 text-2xl font-bold text-green-700">

          <FaRobot />

          AI Conversation

        </h2>

        <p className="mt-2 text-gray-500">

          Chat with SmartCattle AI and receive real-time recommendations.

        </p>

      </div>

      <div className="space-y-5 p-6">

        {chats.map((chat, index) => (

          <div
            key={index}
            className={`flex ${
              chat.type === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-xl rounded-3xl px-5 py-4 shadow ${
                chat.type === "bot"
                  ? "bg-green-50"
                  : "bg-blue-600 text-white"
              }`}
            >

              <p className="leading-7">

                {chat.text}

              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

    {/* HEALTH ANALYSIS */}

    <div className="rounded-3xl bg-white shadow-xl p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-3xl font-bold text-green-700">

            AI Health Analysis

          </h2>

          <p className="text-gray-500 mt-2">

            Live sensor information collected from cattle.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* CARD */}

        <div className="rounded-3xl border-l-8 border-green-500 bg-green-50 p-6 shadow">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Milk Yield

              </p>

              <h2 className="mt-3 text-4xl font-bold text-green-700">

                28.5 L

              </h2>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-red-600">

                ↓ 8% Today

              </div>

            </div>

            <FaPaw className="text-6xl text-green-600" />

          </div>

        </div>

        {/* CARD */}

        <div className="rounded-3xl border-l-8 border-red-500 bg-red-50 p-6 shadow">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Body Temperature

              </p>

              <h2 className="mt-3 text-4xl font-bold text-red-600">

                39.7°C

              </h2>

              <div className="mt-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-orange-600">

                Slightly High

              </div>

            </div>

            <FaHeartbeat className="text-6xl text-red-500" />

          </div>

        </div>

        {/* CARD */}

        <div className="rounded-3xl border-l-8 border-emerald-500 bg-emerald-50 p-6 shadow">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Feed Intake

              </p>

              <h2 className="mt-3 text-4xl font-bold text-green-700">

                18.2 kg

              </h2>

              <div className="mt-4 inline-flex rounded-full bg-yellow-100 px-4 py-2 text-yellow-700">

                Lower than Expected

              </div>

            </div>

            <FaLeaf className="text-6xl text-green-600" />

          </div>

        </div>

        {/* CARD */}

        <div className="rounded-3xl border-l-8 border-blue-500 bg-blue-50 p-6 shadow">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Water Intake

              </p>

              <h2 className="mt-3 text-4xl font-bold text-blue-700">

                56 L

              </h2>

              <div className="mt-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-green-700">

                Normal

              </div>

            </div>

            <FaTint className="text-6xl text-blue-600" />

          </div>

        </div>

      </div>

    </div>

    {/* ================= AI PREDICTIONS ================= */}

    <div className="rounded-3xl bg-white shadow-xl p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-3xl font-bold text-green-700">

            AI Predictions & Recommendations

          </h2>

          <p className="text-gray-500 mt-2">

            Machine learning predictions based on live farm data.

          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Disease Prediction */}

        <div className="rounded-3xl border border-red-200 bg-red-50 p-7">

          <div className="flex items-center justify-between">

            <h3 className="text-2xl font-bold text-red-700">

              Disease Prediction

            </h3>

            <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">

              HIGH RISK

            </span>

          </div>

          <p className="mt-6 text-gray-700 leading-7">

            AI predicts a

            <span className="font-bold text-red-600">

              {" "}72% probability{" "}

            </span>

            of Mastitis developing within the next 48 hours.

          </p>

          <div className="mt-8">

            <div className="flex justify-between mb-2">

              <span>Risk Level</span>

              <span className="font-bold">

                72%

              </span>

            </div>

            <div className="h-4 rounded-full bg-red-100">

              <div
                className="h-4 rounded-full bg-red-600"
                style={{ width: "72%" }}
              />

            </div>

          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">

            <div className="rounded-xl bg-white p-4 text-center">

              <p className="text-gray-500 text-sm">

                Temperature

              </p>

              <h4 className="font-bold text-red-600 mt-2">

                High

              </h4>

            </div>

            <div className="rounded-xl bg-white p-4 text-center">

              <p className="text-gray-500 text-sm">

                Feed

              </p>

              <h4 className="font-bold text-yellow-600 mt-2">

                Low

              </h4>

            </div>

            <div className="rounded-xl bg-white p-4 text-center">

              <p className="text-gray-500 text-sm">

                Milk

              </p>

              <h4 className="font-bold text-red-600 mt-2">

                ↓8%

              </h4>

            </div>

          </div>

        </div>

        {/* Recommendation */}

        <div className="rounded-3xl border border-green-200 bg-green-50 p-7">

          <h3 className="text-2xl font-bold text-green-700">

            AI Recommendations

          </h3>

          <div className="space-y-5 mt-8">

            <div className="rounded-2xl bg-white p-5 shadow">

              ✅ Increase clean water availability immediately.

            </div>

            <div className="rounded-2xl bg-white p-5 shadow">

              🌿 Increase nutritional feed supplements.

            </div>

            <div className="rounded-2xl bg-white p-5 shadow">

              ❄ Move cow to a cooler shaded environment.

            </div>

            <div className="rounded-2xl bg-white p-5 shadow">

              🩺 Schedule veterinary examination today.

            </div>

          </div>

        </div>

      </div>

    </div>

    {/* ================= AI INSIGHTS ================= */}

    <div className="rounded-3xl bg-white shadow-xl p-8">

      <h2 className="text-3xl font-bold text-green-700 mb-8">

        AI Insights

      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="rounded-2xl bg-blue-50 p-6">

          <h3 className="font-bold text-xl text-blue-700">

            Production Analysis

          </h3>

          <ul className="mt-5 space-y-3 text-gray-700">

            <li>• Milk production decreased by 8% today.</li>

            <li>• Feed intake is 11% below normal.</li>

            <li>• Water intake remains stable.</li>

            <li>• Heat stress detected from sensors.</li>

          </ul>

        </div>

        <div className="rounded-2xl bg-purple-50 p-6">

          <h3 className="font-bold text-xl text-purple-700">

            AI Confidence

          </h3>

          <div className="space-y-6 mt-6">

            <div>

              <div className="flex justify-between">

                <span>Milk Prediction</span>

                <span>96%</span>

              </div>

              <div className="mt-2 h-3 rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-600"
                  style={{ width: "96%" }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Disease Detection</span>

                <span>91%</span>

              </div>

              <div className="mt-2 h-3 rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-600"
                  style={{ width: "91%" }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Feed Analysis</span>

                <span>89%</span>

              </div>

              <div className="mt-2 h-3 rounded-full bg-purple-100">

                <div
                  className="h-3 rounded-full bg-purple-600"
                  style={{ width: "89%" }}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>


        {/* ================= RECENT QUESTIONS ================= */}

    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <h2 className="text-3xl font-bold text-green-700">

        Recent Questions

      </h2>

      <div className="mt-8 space-y-4">

        <button className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:bg-green-50 hover:border-green-300">

          💬 Why did milk production decrease today?

        </button>

        <button className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:bg-green-50 hover:border-green-300">

          💬 Which cow requires immediate veterinary attention?

        </button>

        <button className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:bg-green-50 hover:border-green-300">

          💬 Show today's disease predictions.

        </button>

        <button className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:bg-green-50 hover:border-green-300">

          💬 Give feeding recommendations for Cow C-007.

        </button>

      </div>

    </div>

    {/* ================= ASK AI ================= */}

    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <h2 className="text-3xl font-bold text-green-700">

        Ask SmartCattle AI

      </h2>

      <p className="mt-2 text-gray-500">

        Ask any question about cattle health, milk production or disease prediction.

      </p>

      <div className="mt-8 flex gap-4">

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything about your farm..."
          className="flex-1 rounded-2xl border border-gray-300 px-6 py-4 outline-none focus:border-green-600"
        />

        <button className="rounded-2xl bg-green-700 px-8 text-white transition hover:bg-green-800">

          <FaPaperPlane className="text-xl" />

        </button>

      </div>

      <div className="mt-6 flex flex-wrap gap-3">

        <button className="rounded-full bg-green-100 px-5 py-2 text-green-700">

          Milk Prediction

        </button>

        <button className="rounded-full bg-blue-100 px-5 py-2 text-blue-700">

          Disease Risk

        </button>

        <button className="rounded-full bg-yellow-100 px-5 py-2 text-yellow-700">

          Feed Advice

        </button>

        <button className="rounded-full bg-red-100 px-5 py-2 text-red-700">

          Emergency Help

        </button>

      </div>

    </div>

  </div>

  {/* ================= RIGHT SIDEBAR ================= */}

  <div className="space-y-8">

    <div className="rounded-3xl bg-white p-6 shadow-xl">

      <h2 className="text-2xl font-bold text-green-700">

        Live Farm Status

      </h2>

      <div className="mt-6 space-y-5">

        <div className="rounded-2xl bg-green-50 p-5">

          <p className="text-gray-500">

            Healthy Cows

          </p>

          <h2 className="mt-2 text-4xl font-bold text-green-700">

            84

          </h2>

        </div>

        <div className="rounded-2xl bg-blue-50 p-5">

          <p className="text-gray-500">

            Today's Milk

          </p>

          <h2 className="mt-2 text-4xl font-bold text-blue-700">

            782 L

          </h2>

        </div>

        <div className="rounded-2xl bg-yellow-50 p-5">

          <p className="text-gray-500">

            Active Alerts

          </p>

          <h2 className="mt-2 text-4xl font-bold text-yellow-700">

            3

          </h2>

        </div>

        <div className="rounded-2xl bg-red-50 p-5">

          <p className="text-gray-500">

            High Risk Cows

          </p>

          <h2 className="mt-2 text-4xl font-bold text-red-700">

            2

          </h2>

        </div>

      </div>

    </div>

    <div className="rounded-3xl bg-gradient-to-br from-green-700 to-emerald-500 p-6 text-white shadow-xl">

      <h2 className="text-2xl font-bold">

        Smart AI Tip

      </h2>

      <p className="mt-5 leading-7">

        Increase water availability during high temperatures and monitor feed intake every 4 hours to improve milk production and reduce heat stress.

      </p>

    </div>

  </div>

</div>

</div>

</main>

);
}
