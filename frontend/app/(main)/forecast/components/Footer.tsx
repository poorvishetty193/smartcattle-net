"use client";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 pt-6">
      <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-500 md:flex-row">
        <p>
          © 2026 SmartCattleNet. All rights reserved.
        </p>

        <div className="flex gap-6">
          <button className="hover:text-green-700">
            Privacy Policy
          </button>

          <button className="hover:text-green-700">
            Terms of Service
          </button>

          <button className="hover:text-green-700">
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}