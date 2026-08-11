import Image from "next/image";

export default function FarmUpdateCard() {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white">
      {/* Header */}
      <div className="px-5 py-5">
        <h2 className="text-base font-semibold uppercase tracking-wide text-gray-500">
          Latest Farm Update
        </h2>
      </div>

      {/* Update */}
      <div className="flex gap-4 px-5 pb-5">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&q=80"
            alt="Farm update"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Q3 Firmware Update Complete
          </h3>

          <p className="mt-1 text-sm leading-5 text-gray-700">
            Seeing a 12% reduction in detection latency for rumination cycles.
            This is a game changer for early metabolic intervention.
          </p>

          <div className="mt-2 flex items-center gap-5 text-xs text-gray-500">
            <span>2 hours ago</span>
            <span>142 Likes</span>
            <span>24 Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}