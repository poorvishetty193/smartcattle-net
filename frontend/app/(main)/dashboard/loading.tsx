export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5fbf5]">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <p className="mt-5 text-gray-600 font-semibold">Loading Dashboard...</p>
      </div>
    </div>
  );
}
