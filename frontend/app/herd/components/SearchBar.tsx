"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({
  value = "",
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative w-72">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Search by ID or Tag..."
        className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-600 focus:ring-2 focus:ring-green-200"
      />
    </div>
  );
}