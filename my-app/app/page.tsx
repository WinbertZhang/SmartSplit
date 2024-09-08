"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-customBlue flex flex-col">
      {/* Blob 1: Top-middle, slightly down and left */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-2/3 -translate-y-1/4 w-[800px] h-[600px] bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-20 blur-3xl z-0"></div>

      {/* Blob 2: Long oval blob, angled to point bottom right, coming from top */}
      <div className="absolute bottom-0 left-3/4 transform -translate-x-1/2  rotate-[60deg] w-[1000px] h-[550px] bg-gradient-to-br from-blue-600 to-purple-700 opacity-20 blur-3xl z-0"></div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 max-w-screen-lg mx-auto relative z-10">
        {/* Title */}
        <h1 className="text-white text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold mt-8 mb-8">
          Welcome to Smart Split
        </h1>

        {/* Description */}
        <p className="text-gray-400 sm:text-xl mt-8 max-w-2xl mx-auto">
          Upload your receipt, and each roommate can check whether to split each item. 
          You'll get a clear, fair breakdown of the final bill split.
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

      {/* Footer */}
      <footer className="w-full border-t border-gray-700 py-8 text-center text-white">
        <p>© 2024 Smart Split. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
