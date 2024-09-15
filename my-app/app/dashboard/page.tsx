"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";
import { FaReceipt, FaMoneyBillWave, FaChartPie } from "react-icons/fa";

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center relative z-10 mt-20 pt-20">
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-4 relative z-10">
        Dashboard
      </div>
      <p className="text-gray-400 text-center sm:text-xl mb-10 relative z-10 max-w-2xl">
        Your place to upload, manage, and view all your receipts and expense
        splits. Use the dashboard to easily keep track of all your shared
        expenses.
      </p>
      <div className="max-w-screen-lg mx-auto px-6 relative z-10 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/receipt"
            className="bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center"
          >
            <FaReceipt className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">Upload Receipt</h2>
            <p className="text-gray-400 mt-2">
              Upload your receipt and start splitting with your roommates.
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

          {/* View Receipt Graphs Module */}
          <Link
            href="/receipt-graphs"
            className="bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center"
          >
            <FaChartPie className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
            <h2 className="text-lg font-semibold">View Receipt Graphs</h2>
            <p className="text-gray-400 mt-2">
              Analyze the receipt breakdown with graphs.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
