"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Bell,
  TrendingUp,
  Bot,
  FileText,
  Settings,
  Thermometer,
  Radio,
  Plus,
} from "lucide-react";

import Overview from "./overview/page";
import Statistics from "./statistics/page";
import Charts from "./charts/page";
import Widgets from "./widgets/page";
import Analytics from "./analytics/page";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5fbf5] flex">
      {/* Sidebar */}

      <aside className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-5 shadow-sm z-50">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌿</span>
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition"
          >
            <LayoutDashboard size={22} />
          </Link>

          <Link
            href="/herd"
            className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <Users size={22} />
          </Link>

          <Link
            href="/alerts"
            className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <Bell size={22} />
          </Link>

          <Link
            href="/forecast"
            className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <TrendingUp size={22} />
          </Link>

          <Link
            href="/chatbot"
            className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <Bot size={22} />
          </Link>

          <Link
            href="/reports"
            className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <FileText size={22} />
          </Link>
        </nav>

        <div className="mt-auto">
          <Link
            href="/settings"
            className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <Settings size={22} />
          </Link>
        </div>
      </aside>

      {/* Main Content */}

      <div className="flex-1 ml-16 flex flex-col">
        {/* Header */}

        <header className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-40">
          <div>
            <h1 className="text-2xl font-bold text-green-700">Herd Overview</h1>

            <p className="text-sm text-gray-500">
              Satola Farm • 48 Cows • Last Sync 4 min ago
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-green-100 px-4 py-2 rounded-full flex items-center gap-2">
              <Thermometer size={18} className="text-green-700" />

              <span className="text-sm font-semibold text-green-700">
                THI 68 • Comfortable
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Radio size={18} className="text-red-500" />

              <span className="text-sm font-semibold">Live</span>
            </div>
          </div>
        </header>
        {/* Dashboard Content */}

        <div className="flex-1 p-8 space-y-8">
          {/* Overview */}

          <Overview />

          {/* Statistics */}

          <Statistics />

          {/* Charts & Widgets */}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8">
              <Charts />
            </div>

            <div className="xl:col-span-4">
              <Widgets />
            </div>
          </div>

          {/* Analytics */}

          <Analytics />
        </div>

        {/* Footer */}

        <footer className="bg-white border-t border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-green-700 font-bold">SmartCattleNet</span>

            <span className="text-sm text-gray-500">© 2026 SmartCattle AI</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-sm text-gray-500">Powered by AI</span>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>

              <span className="text-sm text-gray-500">Cloud Connected</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Action Button */}

      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-green-600 text-white shadow-xl hover:bg-green-700 transition flex items-center justify-center">
        <Plus size={26} />
      </button>
    </main>
  );
}