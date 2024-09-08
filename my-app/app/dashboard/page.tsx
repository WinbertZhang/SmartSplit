"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig"; // Firebase config
import { FaReceipt, FaMoneyBillWave, FaChartPie } from 'react-icons/fa'; // Icons for receipt, splits, and graphs

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
    <div className="min-h-screen flex flex-col items-center relative z-10 mt-20 pt-20"> {/* Added pb-24 for extra bottom padding */}
      {/* Title */}
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-4 relative z-10">
        Dashboard
      </div>

      {/* Description */}
      <p className="text-gray-400 text-center sm:text-xl mb-10 relative z-10 max-w-2xl">
        Your place to upload, manage, and view all your receipts and expense splits. Use the dashboard to easily keep track of all your shared expenses.
      </p>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-6 relative z-10 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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