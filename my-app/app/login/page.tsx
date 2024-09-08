"use client";

import SignInButton from "@/components/signInButton";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-700 to-gray-900 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login to Smart Split</h1>
        <SignInButton />
      </div>
    </div>
  );
}
