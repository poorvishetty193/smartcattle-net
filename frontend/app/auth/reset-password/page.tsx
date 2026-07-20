"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log(formData);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex">
      {/* LEFT SIDE */}

      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white p-16 flex-col justify-center">
        <h1 className="text-6xl font-extrabold mb-6">SmartCattleNet</h1>

        <h2 className="text-3xl font-bold mb-6 leading-snug">
          Reset your password and secure your account.
        </h2>

        <p className="text-lg text-green-100 leading-8">
          Create a strong password to continue using SmartCattleNet's AI-powered
          livestock management platform.
        </p>
      </section>

      {/* RIGHT SIDE */}

      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800">Reset Password</h2>

            <p className="text-gray-500 mt-3">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NEW PASSWORD */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                New Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
            {/* RESET PASSWORD BUTTON */}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
            >
              Reset Password
              <ArrowRight size={18} />
            </button>

            {/* DIVIDER */}

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>

              <span className="text-gray-500 text-sm">OR</span>

              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* BACK TO LOGIN */}

            <div className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="text-green-600 font-semibold hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>

          {/* FOOTER */}

          <div className="mt-10 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SmartCattleNet.
            <br />
            Climate-Aware Precision Livestock Management.
          </div>
        </div>
      </section>
    </main>
  );
}      