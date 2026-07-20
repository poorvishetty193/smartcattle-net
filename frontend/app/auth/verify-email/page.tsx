"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);

  const handleResend = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Verification email sent successfully!");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex">
      {/* LEFT SIDE */}

      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white p-16 flex-col justify-center">
        <h1 className="text-6xl font-extrabold mb-6">SmartCattleNet</h1>

        <h2 className="text-3xl font-bold leading-snug mb-6">
          Verify your email to activate your account.
        </h2>

        <p className="text-lg text-green-100 leading-8">
          We've sent a verification link to your email address. Please verify
          your email to continue using SmartCattleNet and access all AI-powered
          livestock management features.
        </p>
      </section>

      {/* RIGHT SIDE */}

      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
              <MailCheck size={50} className="text-green-600" />
            </div>

            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Verify Your Email
            </h2>

            <p className="text-gray-500 leading-7">
              We've sent a verification link to your registered email address.
              <br />
              <br />
              Click the link in your inbox to activate your SmartCattleNet
              account.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Resend Verification Email"}

                <ArrowRight size={18} />
              </button>

              <Link
                href="/auth/login"
                className="mt-4 block w-full border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 rounded-xl transition text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>

                

        {/* FOOTER */}

        <div className="mt-10 text-center text-sm text-gray-500">

             Didn't receive the email?

          <br />

          Check your spam folder or click{" "}
          <span className="font-semibold text-green-600">
            Resend Verification Email
          </span>.

        </div>

      </div>

    </section>

  </main>
);
}