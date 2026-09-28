"use client";

import { useEffect, useState } from "react";
import { Thermometer, Radio, ChevronDown } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Cow {
  cow_id: string;
  is_active?: boolean;
}

interface CowsResponse {
  cows?: Cow[];
}

interface UserProfile {
  fullName?: string;
  profileImage?: string;
}

interface UserResponse {
  user?: UserProfile;
}

export default function TopNavbar() {
  const [cowCount, setCowCount] = useState(0);
  const [lastSync, setLastSync] = useState("Syncing...");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadCowCount();
    loadUserProfile();
  }, []);

  async function loadCowCount() {
    try {
      const response = await apiGet("/cows");

      const cows: Cow[] = Array.isArray(response)
        ? response
        : ((response as CowsResponse)?.cows ?? []);

      const activeCows = cows.filter((cow) => cow.is_active !== false);

      setCowCount(activeCows.length);
      setLastSync("just now");
    } catch (error) {
      console.error("Failed to load cow count:", error);
      setLastSync("Unable to sync");
    }
  }

  async function loadUserProfile() {
    try {
      const response = await apiGet("/users/profile");

      const userData = (response as UserResponse)?.user ?? response;

      const profile = userData as UserProfile;

      setUser(profile);

      localStorage.setItem("user", JSON.stringify(profile));
    } catch (error) {
      console.error("Failed to load logged-in farmer:", error);

      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (storageError) {
        console.error("Failed to load cached profile:", storageError);
      }
    }
  }

  const userName = user?.fullName || "";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] w-full border-b border-gray-200 bg-white px-8 flex items-center justify-between">
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold text-green-700">🌱 SmartCattleNet</h1>

        <p className="text-sm text-gray-500">
          Satola Farm • {cowCount} {cowCount === 1 ? "Cow" : "Cows"} • Last Sync{" "}
          {lastSync}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* THI */}
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
          <Thermometer size={18} className="text-green-700" />

          <span className="text-sm font-semibold text-green-700">
            THI 68 • Comfortable
          </span>
        </div>

        {/* LIVE */}
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-red-500" />

          <span className="text-sm font-semibold text-gray-700">Live</span>
        </div>

        {/* FARMER */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-green-200 bg-green-100">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-green-700">
                {userInitial}
              </span>
            )}
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-800">
              {userName || "Farmer"}
            </p>

            <p className="text-xs text-gray-500">Farmer</p>
          </div>

          <ChevronDown size={17} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}
