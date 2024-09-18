"use client";

import Link from "next/link"; // Next.js component for client-side navigation
import Image from "next/image"; // Optimized image component from Next.js

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-customBlue via-customBlue to-green-800 animate-gradientMove">
      {/* Main Content: Two Columns for text and image */}
      <div className="flex-grow flex items-start justify-between max-w-screen-lg py-40 mx-auto relative z-10">
        
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

          {/* Action Button to Upload Receipt */}
          <div className="flex space-x-4">
            <Link href="/upload-receipt" className="block border border-green-400 bg-opacity-10 bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
              Upload Receipt
            </Link>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="hidden md:flex flex-shrink-0">
          <Image
            src="/bill.png"  // Replace with your actual path to 'bill.png'
            alt="Bill Image"
            width={400}      // Adjust the image size as needed
            height={400}     // Adjust the image size as needed
            className="object-contain"
          />
        </div>
      </div>

      {/* Section: Roommate Hassles */}
      <div className="bg-green-400 py-16 px-8 rounded-lg border border-green-400 bg-opacity-10 my-20 max-w-screen-md mx-auto">
        <div className="max-w-3xl mx-auto text-left">
          {/* Section Title */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            We've All Been There
          </h2>
          {/* Section Description */}
          <p className="mt-4 text-lg text-gray-400">
            Picture this: You and your roommates just had a fun night out, but now you're back home with a long receipt. One person says, "I only had the appetizer," while someone else claims, "I didn't drink anything, so I’ll only pay for the entrée." What starts as a simple meal turns into a spreadsheet nightmare. Hours are wasted splitting hairs over every item, and nobody’s happy.
          </p>
        </div>
      </div>

      {/* Section: How Smart Split Works */}
      <div className="bg-green-400 py-16 px-8 rounded-lg border border-green-400 bg-opacity-10 my-20 max-w-screen-md mx-auto">
        <div className="max-w-3xl mx-auto text-left">
          {/* Section Title */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How Smart Split Makes Life Easier
          </h2>
          {/* Section Description */}
          <p className="mt-4 text-lg text-gray-400">
            With Smart Split, those headaches are a thing of the past. Simply upload your receipt, and our intuitive platform helps you and your roommates mark what you ordered. Each person can go through the items, mark their share, and get an instant, fair breakdown—no more awkward arguments or endless calculations.
          </p>
        </div>
      </div>

      {/* Section: Save Time and Avoid Hassle */}
      <div className="bg-green-400 py-16 px-8 rounded-lg border border-green-400 bg-opacity-10 my-20 max-w-screen-md mx-auto">
        <div className="max-w-3xl mx-auto text-left">
          {/* Section Title */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Save Time and Avoid Hassle
          </h2>
          {/* Section Description */}
          <p className="mt-4 text-lg text-gray-400">
            Gone are the days of manually calculating who owes what. Smart Split takes care of everything for you—whether it's a grocery run, a group dinner, or a shared Uber ride. Just upload the receipt, and Smart Split will give each roommate a clear, hassle-free breakdown of their share.
          </p>
        </div>
      </div>

      {/* Section: Get Started */}
      <div className="bg-green-400 py-16 px-8 rounded-lg border border-green-400 bg-opacity-10 my-20 max-w-screen-md mx-auto">
        <div className="max-w-3xl mx-auto text-left">
          {/* Section Title */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Simplify Your Life?
          </h2>
          {/* Section Description */}
          <p className="mt-4 text-lg text-gray-400">
            Start using Smart Split today and say goodbye to the endless discussions over shared expenses. It's fast, easy, and fair. Let Smart Split handle the details so you can spend more time doing what you love.
          </p>

          {/* Action Button to Get Started */}
          <div className="mt-8">
            <Link href="/login" className="block border border-green-400 bg-opacity-10 bg-[#212C40] text-white px-6 py-3 rounded-lg hover:bg-[#1A2535] transition-colors">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
