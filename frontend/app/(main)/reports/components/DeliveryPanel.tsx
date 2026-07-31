"use client";

import { Mail, ActivitySquare, ShieldCheck } from "lucide-react";
import { deliveryItems } from "../reportData";

export default function DeliveryPanel() {
  return (
    <div className="rounded-2xl border border-[#D9E5DB] bg-white p-6 shadow-sm">

      {/* Heading */}

      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-[#203040]">
          Automated Delivery
        </h2>

        <p className="mt-2 text-[14px] text-gray-500">
          Configure intelligent report distribution and monitoring.
        </p>
      </div>

      {/* Toggle List */}

      <div className="space-y-5">

        {deliveryItems.map((item, index) => {

          const Icon =
            index === 0
              ? Mail
              : index === 1
              ? ShieldCheck
              : ActivitySquare;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF6F0]">
                  <Icon className="h-5 w-5 text-[#0C7A5B]" />
                </div>

                <div>
                  <p className="text-[15px] font-semibold text-[#24303A]">
                    {item.title}
                  </p>

                  <p className="text-[13px] text-gray-500">
                    {item.subtitle}
                  </p>
                </div>

              </div>

              <button
                className={`relative h-6 w-11 rounded-full transition ${
                  item.enabled
                    ? "bg-[#0C7A5B]"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${
                    item.enabled
                      ? "left-[22px]"
                      : "left-[2px]"
                  }`}
                />
              </button>

            </div>
          );
        })}

      </div>

      {/* Preview Card */}

      <div className="mt-8 rounded-2xl bg-[#EDF8F0] p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-[15px] font-semibold text-[#0C7A5B]">
              Precision Management
            </p>

            <p className="mt-1 text-[13px] text-gray-600">
              AI-generated reports are ready for distribution.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0C7A5B] text-white">
            📄
          </div>

        </div>

      </div>

    </div>
  );
}