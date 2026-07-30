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
  Brain,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-5 shadow-sm z-50">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
          <span className="text-white text-xl font-bold">🌿</span>
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200"
        >
          <LayoutDashboard size={22} />
        </Link>

        <Link
          href="/herd"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <Users size={22} />
        </Link>

        <Link
          href="/alerts"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <Bell size={22} />
        </Link>

        <Link
          href="/forecast"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <TrendingUp size={22} />
        </Link>

        <Link
          href="/dashboard/predictions"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <Brain size={22} />
        </Link>

        <Link
          href="/chatbot"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <Bot size={22} />
        </Link>

        <Link
          href="/reports"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <FileText size={22} />
        </Link>
      </nav>

      <div className="mt-auto">
        <Link
          href="/settings"
          className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
        >
          <Settings size={22} />
        </Link>
      </div>
    </aside>
  );
}
