"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter(); // Next.js router for navigation
  const searchParams = useSearchParams(); // Get search parameters from URL
  const returnUrl = searchParams.get("returnUrl") || "/"; // Fallback to homepage if no returnUrl

  // Handle Google sign-in using Firebase authentication
  const handleSignIn = async () => {
    const auth = getAuth(); // Get Firebase auth instance
    const provider = new GoogleAuthProvider(); // Initialize Google Auth provider
    try {
      await signInWithPopup(auth, provider); // Sign in using a popup
      router.push(returnUrl); // Redirect to the original page (or homepage) after login
    } catch (error) {
      console.error("Error signing in:", error); // Log any errors during sign-in
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-700 to-gray-900 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {/* Login page title */}
        <h1 className="text-3xl font-bold text-center mb-6">Login to Smart Split</h1>

        {/* Google sign-in button */}
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

// Wrap the login content in a Suspense boundary to handle lazy loading
export default function Login() {
  return (
    <Suspense fallback={<p>Loading login page...</p>}>
      <LoginContent />
    </Suspense>
  );
}
