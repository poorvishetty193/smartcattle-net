"use client";

export default function FloatingButton() {
  return (
    <button
      className="
        fixed
        bottom-6
        right-7
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-[#007D5D]
        text-3xl
        font-light
        text-white
        shadow-lg
        transition
        hover:bg-[#006B4F]
      "
      aria-label="Add"
    >
      +
    </button>
  );
}