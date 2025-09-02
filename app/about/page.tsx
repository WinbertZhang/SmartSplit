"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center pt-24 py-20 px-4 relative z-10 min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex flex-col items-center text-center max-w-screen-md mx-auto space-y-12">
        <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-tight">
          About Smart Split
        </h1>

        <p className="text-gray-300 sm:text-lg leading-relaxed max-w-xl">
          Smart Split is your solution for calculating restaurant bills or shared grocery receipts. Simply snap a picture or upload an image of your receipt, and our app will automatically extract and display the item names and amounts, saving you time on your next grocery run or dinner bill while keeping track of your past split expenses.
        </p>

        <div className="bg-white/10 backdrop-blur-lg text-white p-8 rounded-2xl shadow-lg border border-white/20 w-full">
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Developed by</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Image
                  src="/winbert.jpg"
                  alt="Winbert Zhang"
                  width={120}
                  height={120}
                  className="rounded-full shadow-lg border-2 border-white/20 group-hover:border-purple-400/50 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <p className="text-lg">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">Winbert Zhang</span>
              </p>

              <div className="flex space-x-6">
                <Link href="https://www.linkedin.com/in/winbert" target="_blank">
                  <div className="group relative p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                    <FaLinkedin className="text-2xl text-white group-hover:text-blue-400 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
                <Link href="https://github.com/WinbertZhang" target="_blank">
                  <div className="group relative p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:border-gray-400/50 transition-all duration-300">
                    <FaGithub className="text-2xl text-white group-hover:text-gray-300 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gray-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Image
                  src="/william.jpg"
                  alt="William Huang"
                  width={120}
                  height={120}
                  className="rounded-full shadow-lg border-2 border-white/20 group-hover:border-purple-400/50 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <p className="text-lg">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">William Huang</span>
              </p>

              <div className="flex space-x-6">
                <Link href="https://www.linkedin.com/in/whuang03/" target="_blank">
                  <div className="group relative p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                    <FaLinkedin className="text-2xl text-white group-hover:text-blue-400 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
                <Link href="https://github.com/williamhuang3/" target="_blank">
                  <div className="group relative p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:border-gray-400/50 transition-all duration-300">
                    <FaGithub className="text-2xl text-white group-hover:text-gray-300 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gray-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-lg text-white/90 leading-relaxed">
              Smart Split is built by <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">Winbert Zhang</span> and <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">William Huang</span> to make splitting shared costs smarter and simpler. From splitting restaurant bills to shared grocery receipts, we aim to take the hassle out of managing expenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
