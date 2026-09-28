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
    <aside className="fixed left-0 top-[72px] z-40 flex h-[calc(100vh-72px)] w-16 flex-col border-r border-gray-200 bg-white shadow-sm">
      {/* NAVIGATION */}
      <nav className="flex flex-1 flex-col items-center gap-4 overflow-y-auto py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
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

      {/* SETTINGS */}
      <div className="flex shrink-0 items-center justify-center border-t border-gray-100 py-5">
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
