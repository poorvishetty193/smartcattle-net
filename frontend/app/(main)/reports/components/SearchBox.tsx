"use client";

import { Search } from "lucide-react";

export default function SearchBox() {
  return (
    <div className="relative w-[260px]">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
      />

      <input
        type="text"
        placeholder="Filter reports..."
        className="h-12 w-full rounded-xl border border-[#C9D6CB] bg-[#F6FAF6] pl-11 pr-4 text-[14px] outline-none transition focus:border-[#0C7A5B]"
      />
    </div>
  );
}