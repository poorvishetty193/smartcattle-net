"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Password reset link sent successfully!");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex">
      {/* LEFT SIDE */}

      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white p-16 flex-col justify-center">
        <h1 className="text-6xl font-extrabold mb-6">SmartCattleNet</h1>

        <h2 className="text-3xl font-bold leading-snug mb-6">
          Forgot your password?
        </h2>

        <p className="text-lg text-green-100 leading-8">
          Don't worry! Enter your registered email address and we'll send you a
          password reset link to regain access to your SmartCattleNet account.
        </p>
      </section>

      {/* RIGHT SIDE */}

      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800">
              Forgot Password
            </h2>

            <p className="text-gray-500 mt-3">
              Enter your email to receive a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
            {/* SEND RESET LINK BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Reset Link"}

              <ArrowRight size={18} />
            </button>

            {/* DIVIDER */}

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>

              <span className="text-gray-500 text-sm">OR</span>

              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* BACK TO LOGIN */}

            <Link
              href="/auth/login"
              className="block w-full border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 rounded-xl transition text-center"
            >
              Back to Login
            </Link>
          </form>

          {/* FOOTER */}

          <div className="mt-10 text-center text-sm text-gray-500">
            Remember your password?
            <br />
            Sign in to continue using SmartCattleNet.
          </div>
        </div>
      </section>
    </main>
  );
}