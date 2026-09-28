"use client";

import { useRef, useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaPaw,
  FaHeartbeat,
  FaLeaf,
  FaTint,
  FaTrash,
  FaStop,
} from "react-icons/fa";

type ChatMessage = {
  id: string;
  type: "user" | "bot";
  text: string;
};

type ChatResponse = {
  answer?: string;
  source?: string;
  intent?: string;
  data?: Record<string, unknown>;
};

const API_URL = "http://127.0.0.1:8000/chat";

const QUICK_QUESTIONS = [
  {
    label: "Milk Prediction",
    question: "What is the milk forecast for C100?",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  {
    label: "Heat Stress",
    question: "Is C100 under heat stress?",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    label: "Productivity",
    question: "What is the productivity score of C100?",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  {
    label: "High Risk Cows",
    question: "Which cows are at high risk?",
    className: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  {
    label: "Farm Status",
    question: "How is my farm doing today?",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    label: "Health",
    question: "Which cows need attention?",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
];

const RECENT_QUESTIONS = [
  "Why did milk production decrease this week?",
  "Which cow requires immediate attention?",
  "Show today's health alerts.",
  "How is my milk production today?",
  "Which cows are flagged for heat stress?",
];

export default function ChatbotPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = (type: ChatMessage["type"], text: string) => {
    setChatMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        type,
        text,
      },
    ]);
  };

  const sendMessage = async (question?: string) => {
    const userMessage = (question ?? message).trim();

    if (!userMessage || loading) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    setMessage("");
    setError("");

    addMessage("user", userMessage);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = "";

        try {
          const errorData = await response.json();

          if (typeof errorData?.detail === "string") {
            detail = errorData.detail;
          } else if (typeof errorData?.message === "string") {
            detail = errorData.message;
          }
        } catch {
          // Backend may return a non-JSON error response.
        }

        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to use the SmartCattle AI assistant.",
          );
        }

        throw new Error(
          detail || `Request failed with status ${response.status}.`,
        );
      }

      const data: ChatResponse = await response.json();

      if (!data.answer?.trim()) {
        throw new Error(
          "The backend responded successfully, but no answer was returned.",
        );
      }

      addMessage("bot", data.answer);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      console.error("SmartCattle chatbot error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to SmartCattle AI.",
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGenerating = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
  };

  const clearConversation = () => {
    if (loading) {
      return;
    }

    setChatMessages([]);
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-green-700 to-emerald-500 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold md:text-5xl">
              🤖 SmartCattle AI Assistant
            </h1>

            <p className="mt-3 max-w-3xl text-base text-green-100 md:text-lg">
              Ask about your herd, health predictions, milk production, heat
              stress, productivity, risk and farm management.
            </p>
          </div>

          <button
            type="button"
            onClick={clearConversation}
            disabled={loading || chatMessages.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaTrash />
            Clear Chat
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-4">
        {/* Main content */}
        <div className="xl:col-span-3">
          {/* AI CHAT */}
          <div className="rounded-3xl bg-white p-5 shadow-xl md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-3 text-2xl font-bold">
                <FaRobot className="text-green-600" />
                AI Conversation
              </h2>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Connected to your farm data
              </span>
            </div>

            {/* Chat messages */}
            <div className="min-h-[360px] max-h-[560px] overflow-y-auto rounded-2xl bg-slate-50 p-4 md:p-6">
              {chatMessages.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FaRobot className="text-3xl text-green-600" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-gray-800">
                    Ask SmartCattle AI
                  </h3>

                  <p className="mt-2 max-w-xl text-gray-500">
                    Ask a question below. Your message is sent to the
                    SmartCattleNet backend, which decides whether to use your
                    farm data, cow prediction data, or the cattle knowledge
                    system.
                  </p>

                  <p className="mt-3 text-sm font-medium text-green-700">
                    Try one of the questions below.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((chat) => (
                    <div
                      key={chat.id}
                      className={
                        chat.type === "bot"
                          ? "flex justify-start"
                          : "flex justify-end"
                      }
                    >
                      <div
                        className={
                          chat.type === "bot"
                            ? "max-w-[90%] rounded-2xl rounded-tl-md bg-green-50 p-4 text-gray-800 shadow-sm md:max-w-[80%]"
                            : "max-w-[90%] rounded-2xl rounded-tr-md bg-gray-100 p-4 text-gray-800 shadow-sm md:max-w-[75%]"
                        }
                      >
                        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                          {chat.type === "bot" ? "SmartCattle AI" : "You"}
                        </div>

                        <p className="whitespace-pre-line leading-relaxed">
                          {chat.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-md bg-green-50 px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-green-600" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-green-600 [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-green-600 [animation-delay:300ms]" />
                          <span className="ml-2 text-sm text-gray-600">
                            SmartCattle AI is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Chat input */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Ask anything about your herd..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-5 py-4 outline-none transition focus:border-green-600 disabled:bg-gray-100"
                />

                {loading ? (
                  <button
                    type="button"
                    onClick={stopGenerating}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-700 px-7 py-4 text-white transition hover:bg-gray-800"
                  >
                    <FaStop />
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={!message.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-4 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaPaperPlane />
                    Send
                  </button>
                )}
              </div>

              {/* Quick questions */}
              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-gray-500">
                  Example questions — click to send immediately
                </p>

                <div className="flex flex-wrap gap-3">
                  {QUICK_QUESTIONS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => void sendMessage(item.question)}
                      disabled={loading}
                      className={`rounded-full px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${item.className}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI HEALTH ANALYSIS */}
          <div className="mt-8 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-xl md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-green-700 md:text-3xl">
              AI Health Analysis
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void sendMessage("How is my milk production today?")
                }
                className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <FaPaw className="text-3xl text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold">Milk Yield</h3>
                    <p className="text-gray-500">Click for live AI answer</p>
                  </div>
                </div>

                <p className="text-gray-600">
                  Ask SmartCattle AI for the latest milk-production information
                  from your farm.
                </p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void sendMessage("Which cows are flagged for heat stress?")
                }
                className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <FaHeartbeat className="text-3xl text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold">Heat Stress</h3>
                    <p className="text-gray-500">Click for live AI answer</p>
                  </div>
                </div>

                <p className="text-gray-600">
                  Ask which cows are currently flagged for heat stress.
                </p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => void sendMessage("Which cows need attention?")}
                className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <FaLeaf className="text-3xl text-green-500" />
                  <div>
                    <h3 className="text-lg font-bold">Farm Attention</h3>
                    <p className="text-gray-500">Click for live AI answer</p>
                  </div>
                </div>

                <p className="text-gray-600">
                  Find cows that currently require farm attention.
                </p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => void sendMessage("Which cows are at high risk?")}
                className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <FaTint className="text-3xl text-blue-500" />
                  <div>
                    <h3 className="text-lg font-bold">Risk Monitoring</h3>
                    <p className="text-gray-500">Click for live AI answer</p>
                  </div>
                </div>

                <p className="text-gray-600">
                  Find cows classified as high risk in the latest predictions.
                </p>
              </button>
            </div>
          </div>

          {/* AI PREDICTION & RECOMMENDATION */}
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-green-700 md:text-3xl">
              AI Prediction & Recommendation
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void sendMessage(
                    "Which cows have a predicted milk production drop?",
                  )
                }
                className="rounded-2xl border border-red-200 bg-red-50 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
              >
                <h3 className="text-xl font-bold text-red-700">
                  Milk Drop Prediction
                </h3>

                <p className="mt-4 text-gray-700">
                  Click to ask the backend which cows are currently flagged for
                  a possible milk production drop.
                </p>

                <span className="mt-5 inline-block rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">
                  Ask AI
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void sendMessage(
                    "Which cows currently require farm attention?",
                  )
                }
                className="rounded-2xl border border-green-200 bg-green-50 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
              >
                <h3 className="text-xl font-bold text-green-700">
                  Farm Recommendation
                </h3>

                <p className="mt-4 text-gray-700">
                  Click to get the current cows that require attention from your
                  farm prediction data.
                </p>

                <span className="mt-5 inline-block rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">
                  Ask AI
                </span>
              </button>
            </div>
          </div>

          {/* RECENT QUESTIONS */}
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl md:p-8">
            <h2 className="mb-6 text-2xl font-bold">Recent Questions</h2>

            <div className="space-y-3">
              {RECENT_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(question)}
                  className="w-full rounded-xl bg-gray-100 p-4 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="h-fit rounded-3xl bg-white p-6 shadow-xl xl:sticky xl:top-6">
          <h2 className="mb-6 text-2xl font-bold text-green-700">
            Live Farm Status
          </h2>

          <div className="space-y-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendMessage("How is my farm doing today?")}
              className="w-full rounded-xl bg-green-50 p-4 text-left transition hover:bg-green-100 disabled:opacity-50"
            >
              <p className="text-gray-500">Farm Status</p>
              <h3 className="mt-1 text-lg font-bold text-green-700">
                Ask AI →
              </h3>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void sendMessage("How is my milk production?")}
              className="w-full rounded-xl bg-blue-50 p-4 text-left transition hover:bg-blue-100 disabled:opacity-50"
            >
              <p className="text-gray-500">Today's Milk</p>
              <h3 className="mt-1 text-lg font-bold text-blue-700">Ask AI →</h3>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void sendMessage("Show today's health alerts.")}
              className="w-full rounded-xl bg-yellow-50 p-4 text-left transition hover:bg-yellow-100 disabled:opacity-50"
            >
              <p className="text-gray-500">Health Alerts</p>
              <h3 className="mt-1 text-lg font-bold text-yellow-700">
                Ask AI →
              </h3>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void sendMessage("Which cows are at high risk?")}
              className="w-full rounded-xl bg-red-50 p-4 text-left transition hover:bg-red-100 disabled:opacity-50"
            >
              <p className="text-gray-500">High Risk Cows</p>
              <h3 className="mt-1 text-lg font-bold text-red-700">Ask AI →</h3>
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              No demo answers are used in this chat.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-green-700">
              Every question is sent to the SmartCattleNet backend with the
              logged-in user's authentication token.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
