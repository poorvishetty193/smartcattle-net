"use client";

import {
  Mail,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface DeliveryOption {
  title: string;
  description: string;
  enabled: boolean;
}

interface DeliveryPanelProps {
  options: DeliveryOption[];
}

export default function DeliveryPanel({
  options,
}: DeliveryPanelProps) {
  const icons = [Mail, ShieldCheck, Activity];

  return (
    <section>

      {/* TITLE */}

      <h2
        className="
          font-serif
          text-[17px]
          font-bold
          text-[#006B4F]
        "
      >
        Automated Delivery
      </h2>


      {/* OPTIONS */}

      <div className="mt-4 space-y-3">

        {options.slice(0, 3).map((option, index) => {

          const Icon = icons[index];

          return (
            <div
              key={index}
              className="
                flex
                min-h-[78px]
                items-center
                justify-between
                rounded-xl
                border
                border-[#BFD1C5]
                bg-[#F7FBF8]
                px-4
                py-3
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-lg
                    bg-[#E7F3EA]
                  "
                >
                  <Icon
                    size={17}
                    className="text-[#008060]"
                  />
                </div>

                <div>

                  <h3
                    className="
                      font-serif
                      text-[14px]
                      font-bold
                      text-[#1C2923]
                    "
                  >
                    {option.title}
                  </h3>

                  <p
                    className="
                      mt-1
                      font-serif
                      text-[11px]
                      text-[#64736C]
                    "
                  >
                    {option.description}
                  </p>

                </div>

              </div>


              {/* TOGGLE */}

              <div
                className={`
                  relative
                  h-6
                  w-11
                  rounded-full
                  ${
                    option.enabled
                      ? "bg-[#007D5D]"
                      : "bg-[#D8DED9]"
                  }
                `}
              >
                <div
                  className={`
                    absolute
                    top-1
                    h-4
                    w-4
                    rounded-full
                    bg-white
                    shadow-sm
                    transition
                    ${
                      option.enabled
                        ? "right-1"
                        : "left-1"
                    }
                  `}
                />
              </div>

            </div>
          );
        })}

      </div>


      {/* PREVIEW IMAGE AREA */}

      <div
        className="
          mt-4
          h-[205px]
          overflow-hidden
          rounded-xl
          border
          border-[#BFD1C5]
          bg-[#EAF5ED]
        "
      >

        <div className="flex h-full items-center justify-center">

          <div className="text-center">

            <Activity
              size={42}
              className="mx-auto text-[#008060]"
            />

            <p
              className="
                mt-3
                font-serif
                text-[13px]
                font-semibold
                text-[#006B4F]
              "
            >
              Precision Management Active
            </p>

            <p
              className="
                mt-1
                font-serif
                text-[10px]
                text-[#61736A]
              "
            >
              AI-generated farm intelligence
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}