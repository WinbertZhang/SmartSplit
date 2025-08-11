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
    <header className="fixed w-full top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
      <div className="relative flex justify-between items-center max-w-screen-xl mx-auto h-[70px] px-6">
        {/* Logo on the far left */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="group">
            <div className="relative">
              <Image
                alt="logo"
                src="/smartsplitlogotext.png"
                width={120}
                height={120}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
            </div>
          </Link>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-white p-2 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          >
            <div className="relative">
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </div>
          </button>
        </div>

        {/* Navigation Links (visible on desktop) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group px-4 py-2 rounded-lg text-white/90 text-sm font-medium tracking-wide hover:text-white transition-all duration-300"
            >
              <span className="relative z-10">{link.name}</span>
              <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-3/4 transition-all duration-300"></div>
            </Link>
          ))}
        </nav>

        {/* User Info / Sign-In Button (visible on desktop) */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="w-[1px] h-8 bg-white/20"></div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-white/90 text-sm font-medium">
                  <span className="text-white/60">Welcome, </span>
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                    {user.displayName?.split(" ")[0]}!
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="group relative px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center border border-white/20 hover:border-purple-400/50"
                >
                  <FiLogOut className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm font-medium">Sign Out</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            ) : (
              <div className="relative">
                <SignInButton />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-[70px] left-0 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl z-40">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-blue-900/30 to-indigo-900/30"></div>
            <div className="relative p-6">
              <ul className="flex flex-col items-center space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href} className="w-full">
                    <Link
                      href={link.href}
                      onClick={toggleMenu}
                      className="block w-full text-center py-3 px-4 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
                    >
                      <span className="font-medium tracking-wide">{link.name}</span>
                    </Link>
                  </li>
                ))}
                
                <div className="w-full h-[1px] bg-white/20 my-4"></div>

                {/* Mobile Sign In/Out */}
                <div className="w-full flex justify-center">
                  {user ? (
                    <div className="text-center space-y-3">
                      <p className="text-white/80 text-sm">
                        Welcome, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold">{user.displayName?.split(" ")[0]}!</span>
                      </p>
                      <button
                        onClick={handleSignOut}
                        className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center border border-white/20 hover:border-purple-400/50"
                      >
                        <FiLogOut className="mr-2" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <SignInButton />
                  )}
                </div>
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
