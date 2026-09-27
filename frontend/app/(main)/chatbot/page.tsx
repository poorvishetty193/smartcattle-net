"use client";

import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaPaw,
  FaHeartbeat,
  FaLeaf,
  FaTint,
} from "react-icons/fa";

type ChatMessage = {
  type: "user" | "bot";
  text: string;
};

export default function ChatbotPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        let detail = "";

        try {
          const errorData = await response.json();

          if (typeof errorData?.detail === "string") {
            detail = errorData.detail;
          }
        } catch {
          // Ignore invalid/non-JSON error responses.
        }

        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        throw new Error(
          detail || `Request failed with status ${response.status}.`,
        );
      }

      const data = await response.json();

      setChatMessages((previousMessages) => [
        ...previousMessages,
        {
          type: "user",
          text: userMessage,
        },
        {
          type: "bot",
          text:
            data.answer ||
            "I received your question, but no answer was returned.",
        },
      ]);

      setMessage("");
    } catch (err) {
      console.error("Chatbot error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to SmartCattle AI.",
      );
    } finally {
      setLoading(false);
    }
  };

  const chats = [
    {
      type: "bot",
      text: "Hello 👋 I'm SmartCattle AI Assistant. I can help you with cow health, milk production, disease prediction, feeding recommendations and farm management.",
    },
    {
      type: "user",
      text: "Why has Cow C-007's milk yield decreased today?",
    },
    {
      type: "bot",
      text: "Based on today's sensor readings, milk yield dropped by approximately 8%. Possible reasons include reduced feed intake, increased body temperature, and heat stress.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-green-700 to-emerald-500 p-8 text-white shadow-xl">
        <h1 className="text-5xl font-extrabold">🤖 SmartCattle AI Assistant</h1>

        <p className="mt-4 text-lg text-green-100">
          Ask anything about your herd, health predictions, milk production,
          disease detection and farm management.
        </p>
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-4">
        {/* Left Side */}
        <div className="xl:col-span-3">
          {/* Chat Card */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
              <FaRobot className="text-green-600" />
              AI Conversation
            </h2>

            <div className="space-y-5">
              {/* Existing sample conversation */}
              {chats.map((chat, index) => (
                <div
                  key={`sample-${index}`}
                  className={
                    chat.type === "bot"
                      ? "rounded-xl bg-green-50 p-4"
                      : "rounded-xl bg-gray-100 p-4 text-right"
                  }
                >
                  <p>{chat.text}</p>
                </div>
              ))}

              {/* Real API conversation */}
              {chatMessages.map((chat, index) => (
                <div
                  key={`message-${index}`}
                  className={
                    chat.type === "bot"
                      ? "rounded-xl bg-green-50 p-4"
                      : "rounded-xl bg-gray-100 p-4 text-right"
                  }
                >
                  <p className="whitespace-pre-line">{chat.text}</p>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-gray-600">SmartCattle AI is thinking...</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Health Analysis */}
          <div className="mt-8 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow-xl">
            <h2 className="mb-6 text-3xl font-bold text-green-700">
              AI Health Analysis
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Milk Yield */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center gap-3">
                  <FaPaw className="text-3xl text-green-600" />

                  <div>
                    <h3 className="text-lg font-bold">Milk Yield</h3>
                    <p className="text-gray-500">Current Production</p>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-green-700">28.5 L</h2>

                <p className="mt-3 text-red-500">↓ 8% from yesterday</p>
              </div>

              {/* Body Temperature */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center gap-3">
                  <FaHeartbeat className="text-3xl text-red-500" />

                  <div>
                    <h3 className="text-lg font-bold">Body Temperature</h3>
                    <p className="text-gray-500">Live Sensor</p>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-red-600">39.7°C</h2>

                <p className="mt-3 text-orange-500">Slightly Above Normal</p>
              </div>

              {/* Feed Intake */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center gap-3">
                  <FaLeaf className="text-3xl text-green-500" />

                  <div>
                    <h3 className="text-lg font-bold">Feed Intake</h3>
                    <p className="text-gray-500">Daily Consumption</p>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-green-700">18.2 kg</h2>

                <p className="mt-3 text-yellow-600">Lower than expected</p>
              </div>

              {/* Water Intake */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center gap-3">
                  <FaTint className="text-3xl text-blue-500" />

                  <div>
                    <h3 className="text-lg font-bold">Water Intake</h3>
                    <p className="text-gray-500">Daily Consumption</p>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-blue-700">56 L</h2>

                <p className="mt-3 text-green-600">Normal</p>
              </div>
            </div>
          </div>

          {/* AI Prediction */}
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-3xl font-bold text-green-700">
              AI Prediction & Recommendation
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Disease Prediction */}
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-xl font-bold text-red-700">
                  Disease Prediction
                </h3>

                <p className="mt-4 text-gray-700">
                  AI predicts a{" "}
                  <span className="font-bold text-red-600">
                    72% probability
                  </span>{" "}
                  of Mastitis developing within the next 48 hours.
                </p>

                <div className="mt-5 h-3 w-full rounded-full bg-red-100">
                  <div
                    className="h-3 rounded-full bg-red-600"
                    style={{ width: "72%" }}
                  />
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <h3 className="text-xl font-bold text-green-700">
                  AI Recommendation
                </h3>

                <ul className="mt-4 ml-5 list-disc space-y-3 text-gray-700">
                  <li>Increase water intake monitoring.</li>
                  <li>Provide a cooling environment immediately.</li>
                  <li>Check the udder for swelling.</li>
                  <li>Consult a veterinarian if temperature exceeds 40°C.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Questions */}
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold">Recent Questions</h2>

            <div className="space-y-4">
              <div className="rounded-xl bg-gray-100 p-4">
                Why did milk production decrease this week?
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                Which cow requires immediate attention?
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                Show today's health alerts.
              </div>
            </div>
          </div>

          {/* Ask SmartCattle AI */}
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-green-700">
              Ask SmartCattle AI
            </h2>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Ask anything about your herd..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                disabled={loading}
                className="flex-1 rounded-xl border-2 border-gray-200 px-5 py-4 outline-none focus:border-green-600 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || !message.trim()}
                className="flex items-center justify-center rounded-xl bg-green-700 px-8 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPaperPlane className="text-xl" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Quick Questions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setMessage("What is the milk forecast for C100?")
                }
                className="rounded-full bg-green-100 px-4 py-2 text-green-700 hover:bg-green-200"
              >
                Milk Prediction
              </button>

              <button
                type="button"
                onClick={() => setMessage("Is C100 under heat stress?")}
                className="rounded-full bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
              >
                Disease Risk
              </button>

              <button
                type="button"
                onClick={() =>
                  setMessage("What is the productivity score of C100?")
                }
                className="rounded-full bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-200"
              >
                Feed Recommendation
              </button>

              <button
                type="button"
                onClick={() => setMessage("Which cows are at high risk?")}
                className="rounded-full bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
              >
                Emergency Help
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="h-fit rounded-3xl bg-white p-6 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-green-700">
            Live Farm Status
          </h2>

          <div className="space-y-5">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-gray-500">Healthy Cows</p>
              <h3 className="text-3xl font-bold text-green-700">84</h3>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-gray-500">Today's Milk</p>
              <h3 className="text-3xl font-bold text-blue-700">782 L</h3>
            </div>

            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-gray-500">Alerts</p>
              <h3 className="text-3xl font-bold text-yellow-700">3</h3>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-gray-500">High Risk Cows</p>
              <h3 className="text-3xl font-bold text-red-700">2</h3>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
