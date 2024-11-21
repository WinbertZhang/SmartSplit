"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center mt-20 py-20 px-4 relative z-10">
      <div className="flex flex-col items-center text-center max-w-screen-md mx-auto space-y-12">
        <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-tight">
          About Smart Split
        </h1>

        <p className="text-gray-300 sm:text-lg leading-relaxed max-w-xl">
          Smart Split is your solution for calculating restaurant bills or shared grocery receipts. Simply snap a picture or upload an image of your receipt, and our app will automatically extract and display the item names and amounts, saving you time on your next grocery run or dinner bill while keeping track of your past split expenses.
        </p>

        <div className="bg-[#1B2433] text-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-6">Developed by</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Image
                src="/winbert.jpg"
                alt="Winbert Zhang"
                width={120}
                height={120}
                className="rounded-full shadow-lg"
              />
              
              <p className="text-lg text-gray-400">
                <span className="text-green-400 font-bold">Winbert Zhang</span>
              </p>

              <div className="flex space-x-6">
                <Link href="https://www.linkedin.com/in/winbert" target="_blank">
                  <FaLinkedin className="text-3xl text-white hover:text-green-400 transition-colors" />
                </Link>
                <Link href="https://github.com/WinbertZhang" target="_blank">
                  <FaGithub className="text-3xl text-white hover:text-green-400 transition-colors" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Image
                src="/william.jpg"
                alt="William Huang"
                width={120}
                height={120}
                className="rounded-full shadow-lg"
              />
              
              <p className="text-lg text-gray-400">
                <span className="text-green-400 font-bold">William Huang</span>
              </p>

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

          <p className="mt-8 text-lg text-gray-400">
            Smart Split is built by <span className="text-green-400 font-bold">Winbert Zhang</span> and <span className="text-green-400 font-bold">William Huang</span> to make splitting shared costs smarter and simpler. From splitting restaurant bills to shared grocery receipts, we aim to take the hassle out of managing expenses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
