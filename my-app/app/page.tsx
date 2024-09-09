"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-customBlue flex flex-col">
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 max-w-screen-lg mx-auto relative z-10">
        {/* Title */}
        <h1 className="text-white text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold mt-8 mb-8">
          Welcome to <span className="text-green-400">Smart Split</span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 sm:text-xl mt-8 max-w-2xl mx-auto">
          Upload your receipt, and each roommate can check whether to split each item. 
          You&apos;ll get a clear, fair breakdown of the final bill split.
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Link href="/login" className="block bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
            Login
          </Link>
          <Link href="/receipt" className="block bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
            Receipt
          </Link>
          <Link href="/dashboard" className="block bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
