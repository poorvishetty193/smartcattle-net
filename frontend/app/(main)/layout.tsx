import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5fbf5]">
      {/* Topbar */}
      <TopNavbar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-16 min-h-[calc(100vh-72px)] pt-0">{children}</main>
    </div>
  );
}
