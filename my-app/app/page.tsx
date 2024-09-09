"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-customBlue via-customBlue to-green-800 animate-gradientMove">
      {/* Main Content: Two Columns */}
      <div className="flex-grow flex items-center justify-between max-w-screen-lg mx-auto relative z-10">
        
        {/* Left Column: Text and Buttons */}
        <div className="flex flex-col items-start justify-center text-left space-y-8 max-w-lg">
          {/* Title */}
          <h1 className="text-white text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold mt-8">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-300 bg-clip-text text-transparent">
              Smart Split
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 sm:text-xl mt-8">
            Upload your receipt, and each roommate can check whether to split each item. 
            You&apos;ll get a clear, fair breakdown of the final bill split.
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link href="/receipt" className="block bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
              Upload Receipt
            </Link>
            <Link href="/dashboard" className="block bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="hidden md:flex flex-shrink-0">
          <Image
            src="/bill.png"  // Replace with your actual path to 'bill.png'
            alt="Bill Image"
            width={400}      // Adjust the size as needed
            height={400}     // Adjust the size as needed
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
