"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig"; // Firebase config
import SignInButton from "@/components/signInButton"; // Reuse the SignInButton component
import { FaReceipt, FaMoneyBillWave, FaChartPie } from 'react-icons/fa'; // Icons for receipt, splits, and graphs
import { FiLogOut } from 'react-icons/fi';

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the authenticated user
      } else {
        setUser(null); // Clear the user if logged out
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign-out function
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
            {/* Blob 1: Top-middle, slightly down and left */}
  {/* <div className="absolute top-1/4 left-1/2 transform -translate-x-2/3 -translate-y-1/4 w-[800px] h-[600px] bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-10 blur-3xl z-0"></div> */}
  
  {/* Blob 2: Long oval blob, angled to point bottom right, coming from top */}
  {/* <div className="absolute top-0 left-3/4 transform -translate-x-1/2 -translate-y-1/4 rotate-[30deg] w-[800px] h-[250px] bg-gradient-to-br from-blue-600 to-purple-700 opacity-10 blur-3xl z-0"></div> */}
      <div className="w-full p-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center ml-4">
          <Image alt="logo" src="/smartsplitlogotext.png" width={100} height={100} />
        </div>

        <div className="text-white text-lg font-semibold">
          {user ? (
            <div className="flex items-center">
            <p className="mr-4">Welcome, {user.displayName}!</p>
            <button
              onClick={handleSignOut}
              className="bg-[#212C40] text-white px-4 py-2 rounded-lg hover:bg-[#1A2535] flex items-center transition-colors duration-200"
            >
              <FiLogOut className="mr-1" /> {/* Icon for logging out */}
              Sign Out
            </button>
          </div>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>

      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-slate-900 dark:text-white mt-8 mb-8">
        Dashboard
      </div>

      <p className="text-gray-400 text-center sm:text-xl mt-8">
        Your place to upload, manage, and view all your receipts and expense splits. Use the dashboard to easily keep track of all your shared expenses.
      </p>

      <div className="max-w-screen-lg mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Receipt Module */}
          <Link href="/receipt" className="block bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center">
            <FaReceipt className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">Upload Receipt</h2>
            <p className="text-gray-400 mt-2">Upload your receipt and start splitting with your roommates.</p>
          </Link>

          {/* View Past Splits Module */}
          <Link href="/past-splits" className="block bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center">
            <FaMoneyBillWave className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">View Past Splits</h2>
            <p className="text-gray-400 mt-2">See all your past splits and payments.</p>
          </Link>

          {/* View Receipt Graphs Module */}
          <Link href="/receipt-graphs" className="block bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center">
            <FaChartPie className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">View Receipt Graphs</h2>
            <p className="text-gray-400 mt-2">Analyze the receipt breakdown with graphs.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}