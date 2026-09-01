"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Users,
    label: "Herd",
    href: "/herd",
  },
  {
    icon: Bell,
    label: "Alerts",
    href: "/alerts",
  },
  {
    icon: TrendingUp,
    label: "Forecast",
    href: "/forecast",
  },
  {
    icon: Brain,
    label: "Health",
    href: "/dashboard/predictions",
  },
  {
    icon: Bot,
    label: "Chatbot",
    href: "/chatbot",
  },
  {
    icon: FileText,
    label: "Reports",
    href: "/reports",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-gray-200 bg-white py-5 shadow-sm">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
          <span className="text-xl font-bold text-white">🌿</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "text-gray-500 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="mt-auto">
        <Link
          href="/settings"
          title="Settings"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
            pathname === "/settings"
              ? "bg-green-100 text-green-700"
              : "text-gray-500 hover:bg-green-50 hover:text-green-700"
          }`}
        >
          <Settings size={22} />
        </Link>
      </div>
    </aside>
  );
}
