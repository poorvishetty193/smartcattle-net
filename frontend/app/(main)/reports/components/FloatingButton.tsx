"use client";

import { Plus } from "lucide-react";

export default function FloatingButton() {
  return (
    <button
      className="
        fixed
        bottom-8
        right-8
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-full
        bg-[#006B4F]
        text-white
        shadow-xl
        transition-all
        duration-200
        hover:scale-105
        hover:bg-[#00543E]
      "
    >
      <Plus size={30} strokeWidth={2.5} />
    </button>
  );
}