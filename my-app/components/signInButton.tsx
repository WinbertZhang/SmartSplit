"use client";

import { useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Firebase auth config
import { FaGoogle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

const googleProvider = new GoogleAuthProvider();

export default function SignInButton() {
  const router = useRouter();
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

  // Sign-in function
  const handleSignIn = async (): Promise<void> => {  
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard'); // Redirect to /dashboard after successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Sign-out function
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="text-center">
      {user ? (
        <div className="flex items-center space-x-4">
        <p>Welcome, {user.displayName?.split(" ")[0]}!</p>{" "}
        {/* Display first name */}
        <button
          onClick={handleSignOut}
          className="bg-[#212C40] text-green-400 px-4 py-2 rounded-lg hover:bg-[#1A2535] flex items-center transition-colors duration-200"
        >
          <FiLogOut className="mr-2" /> {/* Icon for logging out */}
          Sign Out
        </button>
      </div>
      ) : (
        <button
          onClick={handleSignIn}
          className=" text-green-400 px-4 py-2 rounded-lg flex items-center justify-center border-green-400 border-[1px] hover:bg-gray-800"
        >
          <FaGoogle className="mr-2" /> Log In
        </button>
      )}
    </div>
  );
}
