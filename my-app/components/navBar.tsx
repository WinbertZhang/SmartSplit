"use client";

import Link from "next/link";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi"; // Import the logout icon
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig"; // Firebase config
import SignInButton from "@/components/signInButton"; // Reuse the SignInButton component
import navLinks from "@/data/navLinks"; // Your navigation links

export default function NavBar() {
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
    <header className="fixed top-0 w-full p-2 bg-transparent backdrop-blur-md border-b border-gray-600 z-50"> {/* Added border-b */}
      <div className="flex justify-between items-center max-w-screen-xl mx-auto h-[60px]">
        {/* Logo on the far left */}
        <div className="flex items-center flex-shrink-0">
          <Image
            alt="logo"
            src="/smartsplitlogotext.png"
            width={100}
            height={100}
            className="ml-0"
          />
        </div>

        {/* Nav Links and User Info grouped together on the right */}
        <div className="flex items-center space-x-8">
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <li
                key={link.href}
                className="text-white text-sm uppercase tracking-wider hover:text-[#35B2EB] transition-all list-none"
              >
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </nav>

          {/* User Account - Show Sign Out Button if User is Logged In */}
          <div className="text-white text-lg font-semibold flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <p>Welcome, {user.displayName?.split(" ")[0]}!</p> {/* Display first name */}
                <button
                  onClick={handleSignOut}
                  className="bg-[#212C40] text-white px-4 py-2 rounded-lg hover:bg-[#1A2535] flex items-center transition-colors duration-200"
                >
                  <FiLogOut className="mr-2" /> {/* Icon for logging out */}
                  Sign Out
                </button>
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
