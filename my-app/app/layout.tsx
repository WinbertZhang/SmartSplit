import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/navBar";

export const metadata: Metadata = {
  title: "Smart Split",
  description: "Split expenses with your friends",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className=" bg-customBlue relative flex flex-col">
          <NavBar />
          <div className="min-h-screen">{children}</div>
        </div>
      </body>
    </html>
  );
}
