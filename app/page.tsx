"use client";

import Link from "next/link"; // Next.js component for client-side navigation
import Image from "next/image"; // Optimized image component from Next.js

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-customBlue via-customBlue to-green-800 animate-gradientMove">
      {/* Main Content: Two Columns for text and image */}
      <div className="flex-grow flex flex-col lg:flex-row items-start justify-between max-w-screen-lg pt-40 md:pt-60 mx-auto relative z-10 px-4 md:px-0">
        
        {/* Left Column: Text and Buttons */}
        <div className="flex flex-col items-start justify-center text-left space-y-8 max-w-lg md:pr-8">
          {/* Title */}
          <h1 className="text-white text-6xl leading-tight md:leading-none tracking-tight font-bold mt-8">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-300 bg-clip-text text-transparent">
              Smart Split
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-lg md:text-xl mt-4 md:mt-8">
          Upload your receipt, and let Smart Split fairly divide the bill with your roommates. No more headaches over who owes what.
          </p>

          {/* Action Button to Upload Receipt */}
          <div className="flex space-x-4">
            <Link href="/upload-receipt" className="block border border-green-400 bg-opacity-10 bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
              Upload Receipt
            </Link>
          </div>
        </div>

        {/* Right Column: Image (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-shrink-0">
          <Image
            src="/receipt.svg"
            alt="Receipt Image"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

    </div>
  );
}
