"use client";

import Image from "next/image";
import { ArrowRight, AlertTriangle, TrendingDown } from "lucide-react";
import { Cow } from "../types/cow";

interface Props {
  cow: Cow;
}

export default function CowCard({ cow }: Props) {
  const statusColor = {
    CRITICAL: "bg-red-600 text-white",
    HEALTHY: "bg-green-600 text-white",
    WARNING: "bg-yellow-500 text-white",
    STABLE: "bg-gray-500 text-white",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100">

            {cow.image ? (
              <Image
                src={cow.image}
                alt={cow.id}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-500">
                Cow
              </div>
            )}

          </div>

          <div>

            <h3 className="font-bold text-gray-900">
              {cow.id}
            </h3>

            <p className="text-xs text-gray-500">
              Lactation: {cow.lactation}
            </p>

          </div>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${
            statusColor[cow.status]
          }`}
        >
          {cow.status}
        </span>

      </div>

      {/* Metric Bars */}

      <div className="mt-5 grid grid-cols-4 gap-3">

        {cow.metrics.map((metric) => (

          <div key={metric.label}>

            <div className="flex h-16 items-end rounded-md bg-gray-100">

              <div
                className={`w-full rounded-md ${metric.color}`}
                style={{
                  height: `${metric.value}%`,
                }}
              />

            </div>

            <p className="mt-1 text-center text-[10px] font-semibold text-gray-500">
              {metric.label}
            </p>

          </div>

        ))}

      </div>

      {/* Prediction Cards */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className={`${cow.prediction1.bgColor} rounded-xl p-3`}>

          <div className="mb-2 flex items-center gap-2">

            <TrendingDown
              size={18}
              className={cow.prediction1.textColor}
            />

            <span
              className={`text-[10px] font-bold uppercase ${cow.prediction1.textColor}`}
            >
              {cow.prediction1.title}
            </span>

          </div>

          <p
            className={`text-sm font-bold ${cow.prediction1.textColor}`}
          >
            {cow.prediction1.value}
          </p>

        </div>

        <div className={`${cow.prediction2.bgColor} rounded-xl p-3`}>

          <div className="mb-2 flex items-center gap-2">

            <AlertTriangle
              size={18}
              className={cow.prediction2.textColor}
            />

            <span
              className={`text-[10px] font-bold uppercase ${cow.prediction2.textColor}`}
            >
              {cow.prediction2.title}
            </span>

          </div>

          <p
            className={`text-sm font-bold ${cow.prediction2.textColor}`}
          >
            {cow.prediction2.value}
          </p>

        </div>

      </div>

      {/* Footer */}

      <button className="mt-5 flex w-full items-center justify-center gap-2 border-t pt-4 text-sm font-semibold text-green-700 transition hover:text-green-900">

        View Full Profile

        <ArrowRight size={18} />

      </button>

    </div>
  );
}