"use client";

import { Plus } from "lucide-react";

export default function AddCowCard() {
  return (
    <button className="group flex min-h-[340px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all hover:border-green-600 hover:bg-green-50">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transition-all group-hover:scale-110">

        <Plus
          size={32}
          className="text-green-700"
        />

      </div>

      <h3 className="text-lg font-bold text-green-700">
        Register New Asset
      </h3>

      <p className="mt-2 max-w-[220px] text-center text-sm text-gray-500">
        Configure IoT tag and biological profile
      </p>

    </button>
  );
}