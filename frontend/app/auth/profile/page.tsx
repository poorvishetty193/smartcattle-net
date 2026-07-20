"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    location: "Mangalore, Karnataka",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Profile Updated Successfully!");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex">
      {/* LEFT */}

      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white p-16 flex-col justify-center">
        <h1 className="text-6xl font-extrabold mb-6">SmartCattleNet</h1>

        <h2 className="text-3xl font-bold mb-6">Manage Your Profile</h2>

        <p className="text-lg text-green-100 leading-8">
          Keep your personal information updated so your SmartCattleNet account
          stays secure and up to date.
        </p>
      </section>

      {/* RIGHT */}

      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-5">
              <User size={50} className="text-green-600" />
            </div>

            <h2 className="text-4xl font-bold text-gray-800">My Profile</h2>

            <p className="text-gray-500 mt-2">
              Update your personal information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}

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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
            {/* PHONE */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            {/* LOCATION */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Location
              </label>

              <div className="relative">
                <MapPin
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            {/* SAVE BUTTON */}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </button>
          </form>

          {/* FOOTER */}

          <div className="mt-10 text-center text-sm text-gray-500">
            Keep your profile information updated to receive important
            SmartCattleNet notifications.
          </div>
        </div>
      </section>
    </main>
  );
}