"use client";

import Link from "next/link";
import Image from "next/image";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"; // Import the logout, menu, and close icons
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig"; // Firebase config
import SignInButton from "@/components/signInButton"; // Reuse the SignInButton component
import navLinks from "@/data/navLinks"; // Your navigation links

export default function NavBar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track menu toggle state

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

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed w-full p-2 bg-transparent backdrop-blur-md border-b border-gray-600 z-50">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto h-[60px] px-4">
        {/* Logo on the far left */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/">
            <Image
              alt="logo"
              src="/smartsplitlogotext.png"
              width={100}
              height={100}
              className=""
            />
          </Link>
        </div>

        {/* Hamburger Icon for Mobile and Navigation Links */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Navigation Links (visible on desktop, hidden on mobile) */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li
              key={link.href}
              className="text-white text-md tracking-wider hover:text-green-400 transition-all list-none"
            >
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}
        </nav>

        {/* User Info / Sign-In Button (visible on desktop, hidden on mobile) */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="w-[1px] h-10 bg-gray-600"></div>

          <div className="text-green-400 text-md tracking-wider flex items-center space-x-4">
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
              <SignInButton />
            )}
          </div>
        </div>

        {/* Mobile Menu (hidden on desktop, shown on mobile when menu is open) */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-[60px] left-0 w-full bg-gray-900 text-white p-4 shadow-md z-40">
            <ul className="flex flex-col items-center space-y-4">
              {navLinks.map((link) => (
                <li
                  key={link.href}
                  className="text-white text-md tracking-wider hover:text-green-400 transition-all"
                >
                  <Link href={link.href} onClick={toggleMenu}>
                    {link.name}
                  </Link>
                </li>
              ))}
              <div className="w-full h-[1px] bg-gray-600 my-2"></div>

              {/* Show Sign In/Out in mobile view */}
              <div className="text-center">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="bg-[#212C40] text-green-400 px-4 py-2 rounded-lg hover:bg-[#1A2535] flex items-center justify-center transition-colors duration-200"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                ) : (
                  <SignInButton />
                )}
              </div>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
