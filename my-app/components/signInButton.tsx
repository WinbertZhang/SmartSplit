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

const googleProvider = new GoogleAuthProvider();

export default function SignInButton() {
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
        <div>
          <p className="text-xl font-semibold mb-4">Welcome, {user.displayName}!</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
