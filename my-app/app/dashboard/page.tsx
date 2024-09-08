"use client";

import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  const userName = "John Doe"; // Example user

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Gradient Banner */}
      <div
        className="w-full p-4"
        style={{
          backgroundImage:
            "linear-gradient(to right top, #ff914d, #ffa44b, #ffb74c, #ffcb50, #ffde59)",
        }}
      >
        <div className="flex justify-between items-center max-w-screen-lg mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <Image alt="logo" src="/smartsplitlogotext.png" width={100} height={100} />
          </div>
          {/* User Account */}
          <div className="text-white text-lg font-semibold">
            {userName}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Receipt Module */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4">Add a Receipt</h2>
            <Link href="/receipt">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                Upload Receipt
              </button>
            </Link>
          </div>

          {/* View Past Splits Module */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4">View Past Splits</h2>
            <Link href="/past-splits">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                See Splits
              </button>
            </Link>
          </div>

          {/* Graphs of Past Receipts Module */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4">View Receipt Graphs</h2>
            <Link href="/receipt-graphs">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                View Graphs
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
