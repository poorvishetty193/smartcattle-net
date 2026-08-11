import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5fbf5] flex">
      <Sidebar />

      <div className="flex-1 ml-16 flex flex-col">
        <TopNavbar />

        <main className="flex-1 pt-[72px]">{children}</main>
      </div>
    </div>
  );
}
