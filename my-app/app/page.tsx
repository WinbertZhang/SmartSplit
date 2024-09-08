"use client"

import Link from "next/link";

export default function Dashboard() {

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-screen-lg mx-auto">
        <Link href="/receipt"> RECEIPT </Link>
      </div>
    </div>
  );
}
