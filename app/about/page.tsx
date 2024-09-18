"use client";

import React from 'react'
import Link from 'next/link'

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-700 via-gray-800 to-black animate-gradientMove px-4 py-10">
      <div className="flex flex-col items-center text-center max-w-screen-lg mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-white text-[2rem] leading-none sm:text-5xl tracking-tight font-bold">
          About Smart Split
        </h1>

        {/* Intro Section */}
        <p className="text-gray-300 sm:text-lg leading-relaxed">
          Smart Split is your solution for hassle-free receipt splitting with
          roommates, friends, or family. It simplifies the process of sharing
          expenses by allowing each user to select what they’ve consumed, giving
          everyone a clear breakdown of what they owe.
        </p>

        {/* Development Credits */}
        <div className="bg-[#212C40] text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Developed by
          </h2>
          <p className="text-lg text-gray-400">
            Smart Split was created by <span className="text-green-400 font-bold">Winbert Zhang</span> and <span className="text-green-400 font-bold">William Huang</span>, who saw the need for a smarter, fairer way to split expenses.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Our Mission
          </h2>
          <p className="text-lg">
            At Smart Split, we believe that splitting bills should be simple,
            fair, and quick. Whether it's for groceries, a group meal, or a
            weekend trip, our goal is to take the stress out of dividing
            expenses and let you focus on spending time with the people that
            matter.
          </p>
        </div>

        {/* Get Started Section */}
        <div className="bg-[#212C40] text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Get Started with Smart Split
          </h2>
          <p className="text-lg text-gray-400">
            Ready to make splitting expenses easier? Start using Smart Split
            today and discover a better way to manage shared costs.
          </p>
          <Link href="/upload-receipt" className="block mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all shadow-lg">
            Upload Receipt
          </Link>
        </div>

        {/* Back to Home */}
        <Link href="/" className="text-green-400 hover:text-green-300 text-lg underline mt-8">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AboutPage;