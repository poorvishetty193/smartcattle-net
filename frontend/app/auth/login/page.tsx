"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = new URLSearchParams();

      form.append("grant_type", "password");
      form.append("username", email);
      form.append("password", password);
      form.append("scope", "");
      form.append("client_id", "");
      form.append("client_secret", "");

      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.access_token);

      alert("Login Successful!");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-950 via-emerald-900 to-green-800">
      {/* Background Overlay */}

      <div className="absolute inset-0 bg-black/40" />

      {/* Blur Circle */}

      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-green-400/20 blur-3xl" />

      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-7xl gap-10 lg:grid-cols-2">
          {/* LEFT SECTION */}

          <div className="hidden flex-col justify-center text-white lg:flex">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex h-[70px] w-[70px] items-center justify-center rounded-xl bg-green-700 text-3xl text-white">
                  🐄
                </div>
              </div>

              <div>
                <h1 className="text-5xl font-bold">SmartCattleNet</h1>

                <p className="mt-2 text-lg text-green-100">
                  Climate-aware Precision Livestock Management
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-5xl font-bold leading-tight">
                Smarter Farming.
                <br />
                Better Decisions.
                <br />
                Healthier Cattle.
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-8 text-green-100">
                Monitor every cattle in real time using AI. Predict milk yield,
                stress, diseases, weather impact, productivity, breeding
                performance and much more using SmartCattleNet.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <h3 className="text-4xl font-bold">98%</h3>

                <p className="mt-2 text-green-100">Prediction Accuracy</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <h3 className="text-4xl font-bold">24/7</h3>

                <p className="mt-2 text-green-100">Live Monitoring</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <h3 className="text-4xl font-bold">12+</h3>

                <p className="mt-2 text-green-100">AI Prediction Modules</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <h3 className="text-4xl font-bold">Real-Time</h3>

                <p className="mt-2 text-green-100">Farm Analytics</p>
              </div>
            </div>
          </div>

          {/* RIGHT LOGIN CARD */}

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome Back 👋
                </h2>

                <p className="mt-2 text-gray-500">Sign in to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Email */}

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="manager@farm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                    required
                  />
                </div>

                {/* Password */}

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-16 outline-none transition focus:border-green-600"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-green-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {/* Remember Me & Forgot Password */}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
                    />
                    Remember Me
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition duration-300 hover:bg-green-800"
                >
                  Sign In
                </button>

                {/* Divider */}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">
                      OR
                    </span>
                  </div>
                </div>

                {/* Google Login */}

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 py-3 transition hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-6 w-6"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.233 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.318 4.337-17.694 10.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.715 36 24 36c-5.211 0-9.619-3.329-11.283-7.946l-6.522 5.025C9.535 39.556 16.227 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.236 4.167-4.094 5.57l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Demo Login */}

                <button
                  type="button"
                  className="w-full rounded-xl border border-green-700 py-3 font-semibold text-green-700 transition hover:bg-green-50"
                >
                  Use Demo Account
                </button>

                {/* Register */}

                <div className="pt-2 text-center text-sm text-gray-600">
                  Don't have an account?
                  <Link
                    href="/auth/register"
                    className="ml-2 font-semibold text-green-700 hover:text-green-800"
                  >
                    Register
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}

      <footer className="absolute bottom-6 left-0 right-0 z-10">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-green-100">
          <p>
            © {new Date().getFullYear()} SmartCattleNet. All Rights Reserved.
          </p>

          <p className="text-green-200">
            Climate-Aware Precision Livestock Management
          </p>
        </div>
      </footer>
    </main>
  );
}
