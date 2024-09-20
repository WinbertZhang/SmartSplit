"use client";

import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center mt-20 py-20 relative z-10">
      <div className="flex flex-col items-center text-center max-w-screen-md mx-auto space-y-12">
        {/* Page Title */}
        <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-tight">
          About Smart Split
        </h1>

        {/* Intro Section */}
        <p className="text-gray-300 sm:text-lg leading-relaxed max-w-xl">
          Smart Split simplifies shared expenses, making it effortless to split bills with roommates, friends, or family. Say goodbye to awkward calculations and let everyone pay for exactly what they consumed.
        </p>

        {/* Development Credits */}
        <div className="bg-[#1B2433] text-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Developed by</h2>
          <p className="text-lg text-gray-400">
            Built by <span className="text-green-400 font-bold">Winbert Zhang</span> and <span className="text-green-400 font-bold">William Huang</span>, Smart Split was born from the desire to provide a smarter, fairer way to split shared costs.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-green-500 text-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg">
            At Smart Split, we aim to remove the stress from dividing expenses. Whether it's a dinner with friends or a weekend getaway, we make the process seamless, quick, and fair.
          </p>
        </div>

        {/* Get Started Section */}
        <div className="bg-[#1B2433] text-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Get Started with Smart Split</h2>
          <p className="text-lg text-gray-400">
            Ready to transform how you split bills? Start using Smart Split today and experience a new, hassle-free way to manage shared costs.
          </p>
          <Link href="/upload-receipt" className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all shadow-lg inline-block">
            Upload Receipt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
