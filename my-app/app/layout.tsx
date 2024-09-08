import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
import NavBar from "@/components/navBar";

export const metadata: Metadata = {
  title: "SplitSmart",
  description: "Split expenses with your friends",
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="overflow-hidden"> {/* Prevents extra scroll */}
        <div className="min-h-screen bg-customBlue relative flex flex-col">
          {/* Blob 1: Fixed, so it stays in place */}
          <div className="fixed top-1/4 left-1/2 transform -translate-x-2/3 -translate-y-1/4 w-[800px] h-[600px] bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-20 blur-3xl z-0"></div>

          {/* Blob 2: Fixed, so it stays in place */}
          <div className="fixed bottom-0 left-3/4 transform -translate-x-1/2 rotate-[60deg] w-[1000px] h-[550px] bg-gradient-to-br from-blue-600 to-purple-700 opacity-20 blur-3xl z-0"></div>

          {/* Navbar stays on top of blobs */}
          <NavBar />

          {/* Content */}
          <div className="relative z-10 flex-grow">
            {children} {/* Dashboard or other pages */}
          </div>
        </div>
      </body>
    </html>
  );
}
