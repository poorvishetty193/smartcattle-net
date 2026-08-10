"use client";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();

   if (formData.password !== formData.confirmPassword) {
     alert("Passwords do not match");
     return;
   }

   try {
     const data = await apiPost("/auth/signup", {
       name: formData.fullName,
       email: formData.email,
       password: formData.password,
     });

     console.log(data);

     alert("Registration Successful!");

     router.push("/auth/login");
   } catch (error: any) {
  console.error("Registration Error:", error);

  if (error?.response?.data) {
    console.log(error.response.data);
    alert(JSON.stringify(error.response.data));
  } else if (error?.message) {
    alert(error.message);
  } else {
    alert("Registration Failed");
  }
}
 };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex">
      {/* LEFT SIDE */}

      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white p-16 flex-col justify-center">
        <h1 className="text-6xl font-extrabold mb-6">SmartCattleNet</h1>

        <h2 className="text-3xl font-bold leading-snug mb-6">
          Create your account and start managing your smart farm.
        </h2>

        <p className="text-lg text-green-100 leading-8">
          Climate-aware precision livestock management platform with AI
          predictions, digital twins, health monitoring, milk forecasting,
          weather intelligence, alerts and complete herd management.
        </p>
      </section>

      {/* RIGHT SIDE */}

      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-gray-800">Create Account</h2>

            <p className="text-gray-500 mt-3">Join SmartCattleNet today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FULL NAME */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>

              <div className="relative">
                <User
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            {/* EMAIL */}

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
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
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
                  placeholder="Confirm password"
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
            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight size={18} />
            </button>

            {/* DIVIDER */}

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>

              <span className="text-gray-500 text-sm">OR</span>

              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* GOOGLE BUTTON */}

            <button
              type="button"
              className="w-full border border-gray-300 hover:bg-gray-100 py-3 rounded-xl font-semibold transition"
            >
              Continue with Google
            </button>

            {/* LOGIN LINK */}

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-green-600 font-semibold hover:underline"
              >
                Sign In
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