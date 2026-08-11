import Image from "next/image";

export default function ProfileCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center">
        <Image
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
          alt="Profile"
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />

        <h2 className="mt-5 text-3xl font-semibold text-gray-900">
          Marcus Thorne
        </h2>

        <p className="mt-1 text-center text-gray-500">
          Principal, Thorne Valley Estates
        </p>
      </div>

      <div className="my-6 border-t border-gray-200" />

      <div className="space-y-5">
        <div className="flex justify-between">
          <span className="text-gray-500">Connections</span>
          <span className="font-semibold">1,248</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Network Rank</span>
          <span className="font-semibold text-green-700">Top 2%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Cattle Count</span>
          <span className="font-semibold">482</span>
        </div>
      </div>
    </div>
  );
}