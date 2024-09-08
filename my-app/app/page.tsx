"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "linear-gradient(to right top, #ff914d, #ffa44b, #ffb74c, #ffcb50, #ffde59)",
      }}
    >
      {/* Header with Logo */}
      <header className="w-full py-4 px-8 bg-transparent flex items-center">
        {/* Logo on the top left */}
        <div className="flex items-center">
          <Image alt="logo" src="/smartsplitlogotext.png" width={120} height={120} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8">
        {/* Title */}
        <h1 className="text-white text-5xl font-extrabold">
          Welcome to Smart Split
        </h1>

        {/* Description */}
        <p className="text-white text-lg max-w-2xl mx-auto">
          Upload your receipt, and each roommate can check whether to split each item. 
          You'll get a clear, fair breakdown of the final bill split.
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Link href="/login">
            <button className="bg-white text-orange-500 px-6 py-3 text-lg font-semibold rounded-lg hover:bg-gray-100 transition">
              Login
            </button>
          </Link>
          <Link href="/receipt">
            <button className="bg-white text-orange-500 px-6 py-3 text-lg font-semibold rounded-lg hover:bg-gray-100 transition">
              Receipt
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="bg-white text-orange-500 px-6 py-3 text-lg font-semibold rounded-lg hover:bg-gray-100 transition">
              Dashboard
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white">
        <p>© 2024 Smart Split. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
