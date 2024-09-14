"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/"; // Default to homepage if no returnUrl

  const handleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push(returnUrl); // Redirect back to the original page after login
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-700 to-gray-900 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login to Smart Split</h1>
        <button
          onClick={handleSignIn}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition-all"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<p>Loading login page...</p>}>
      <LoginContent />
    </Suspense>
  );
}