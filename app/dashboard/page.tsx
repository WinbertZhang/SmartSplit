"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";
import { FaReceipt, FaMoneyBillWave, FaChartPie } from "react-icons/fa";

export default function Dashboard() {
  // State to store the authenticated user
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // useEffect hook to listen to authentication state changes (login/logout)
  useEffect(() => {
    // Subscribe to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null); // Set the user or null if no user is authenticated
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center relative z-10 mt-20 pt-20">
      {/* Dashboard Header */}
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-4 relative z-10">
        Dashboard
      </div>

      {/* Subheader explaining the purpose of the dashboard */}
      <p className="text-gray-400 text-center sm:text-xl mb-10 relative z-10 max-w-2xl">
        Your place to upload, manage, and view all your receipts and expense
        splits. Use the dashboard to easily keep track of all your shared
        expenses.
      </p>

      {/* Main content area */}
      <div className="max-w-screen-lg mx-auto px-6 relative z-10 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Upload Receipt Module */}
          <Link
            href="/upload-receipt"
            className="bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center"
          >
            <FaReceipt className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">Upload Receipt</h2>
            <p className="text-gray-400 mt-2">
              Upload your receipt and start splitting with your friends or roommates.
            </p>
          </Link>

          {/* View Past Splits Module */}
          <Link
            href="/past-splits"
            className="bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center"
          >
            <FaMoneyBillWave className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">View Past Splits</h2>
            <p className="text-gray-400 mt-2">
              See all your past splits and payments.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
