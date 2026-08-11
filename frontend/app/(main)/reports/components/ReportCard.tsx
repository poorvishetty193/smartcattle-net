"use client";

import { LucideIcon } from "lucide-react";

interface ReportCardProps {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
  period: string;
  buttonText: string;
  buttonColor: string;
}

export default function ReportCard({
  icon: Icon,
  iconBg,
  title,
  description,
  period,
  buttonText,
  buttonColor,
}: ReportCardProps) {
  return (
    <div
      className="
        min-h-[267px]
        rounded-xl
        border
        border-[#C9D8CE]
        bg-white
        p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
      "
    >

      {/* TOP */}

      <div className="flex items-start justify-between">

        <div
          className={`
            flex h-12 w-12
            items-center justify-center
            rounded-lg
            ${iconBg}
          `}
        >
          <Icon className="h-5 w-5 text-[#17352A]" />
        </div>

        <span
          className="
            pt-1
            font-serif
            text-[11px]
            font-bold
            tracking-wide
            text-[#34443C]
          "
        >
          {period}
        </span>

      </div>


      {/* CONTENT */}

      <div className="mt-5">

        <h2
          className="
            font-serif
            text-[16px]
            font-bold
            text-[#17251F]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            max-w-[390px]
            font-serif
            text-[12px]
            leading-[1.55]
            text-[#52645B]
          "
        >
          {description}
        </p>

      </div>


      {/* BUTTON */}

      <button
        className={`
          mt-6
          h-[43px]
          w-full
          rounded-lg
          font-serif
          text-[15px]
          font-semibold
          text-white
          transition
          hover:brightness-95
          ${buttonColor}
        `}
      >
        {buttonText}
      </button>

    </div>
  );
}