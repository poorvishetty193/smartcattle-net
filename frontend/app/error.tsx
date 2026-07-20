"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Something went wrong!</h1>

      <p className="mt-4 text-gray-600">{error.message}</p>

      <button
        onClick={() => reset()}
        className="mt-6 rounded bg-green-600 px-5 py-2 text-white"
      >
        Try Again
      </button>
    </div>
  );
}
