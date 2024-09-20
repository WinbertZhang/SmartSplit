"use client";

import Link from 'next/link';
import Image from 'next/image'; // For profile pictures
import { FaLinkedin, FaGithub } from 'react-icons/fa'; // React icons for LinkedIn and GitHub

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

        {/* Development Credits with Profile Pics and Social Icons */}
        <div className="bg-[#1B2433] text-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-6">Developed by</h2>

          {/* Developer Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center justify-center">
            {/* Winbert Zhang */}
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Picture */}
              <Image
                src="/winbert.jpg" // Replace with Winbert's actual profile image path
                alt="Winbert Zhang"
                width={120}
                height={120}
                className="rounded-full shadow-lg"
              />
              
              {/* Developer Name */}
              <p className="text-lg text-gray-400">
                <span className="text-green-400 font-bold">Winbert Zhang</span>
              </p>

              {/* Social Icons */}
              <div className="flex space-x-6">
                <Link href="https://www.linkedin.com/in/winbert" target="_blank">
                  <FaLinkedin className="text-3xl text-white hover:text-green-400 transition-colors" />
                </Link>
                <Link href="https://github.com/WinbertZhang" target="_blank">
                  <FaGithub className="text-3xl text-white hover:text-green-400 transition-colors" />
                </Link>
              </div>
            </div>

            {/* William Huang */}
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Picture */}
              <Image
                src="/william.jpg" // Replace with William's actual profile image path
                alt="William Huang"
                width={120}
                height={120}
                className="rounded-full shadow-lg"
              />
              
              {/* Developer Name */}
              <p className="text-lg text-gray-400">
                <span className="text-green-400 font-bold">William Huang</span>
              </p>

              {/* Social Icons */}
              <div className="flex space-x-6">
                <Link href="https://www.linkedin.com/in/whuang03/" target="_blank">
                  <FaLinkedin className="text-3xl text-white hover:text-green-400 transition-colors" />
                </Link>
                <Link href="https://github.com/williamhuang3/" target="_blank">
                  <FaGithub className="text-3xl text-white hover:text-green-400 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Developer Description */}
          <p className="mt-8 text-lg text-gray-400">
            Built by <span className="text-green-400 font-bold">Winbert Zhang</span> and <span className="text-green-400 font-bold">William Huang</span>, Smart Split was created to provide a smarter, fairer way to split shared costs with friends, roommates, and family.
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
