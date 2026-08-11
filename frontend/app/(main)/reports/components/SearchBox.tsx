"use client";

import { Search } from "lucide-react";

export default function SearchBox() {
  return (
    <div
      className="
        flex
        h-10
        w-[260px]
        items-center
        gap-2
        rounded-lg
        border
        border-[#BFD1C5]
        bg-[#F5F9F6]
        px-3
      "
    >

      <Search
        size={16}
        className="text-[#53635A]"
      />

      <input
        type="text"
        placeholder="Filter reports..."
        className="
          w-full
          bg-transparent
          font-serif
          text-[11px]
          text-[#26352D]
          outline-none
          placeholder:text-[#75847C]
        "
      />

    </div>
  );
}