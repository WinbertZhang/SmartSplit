import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/navBar";

export const metadata: Metadata = {
  title: "SplitSmart",
  description: "Split expenses with you friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
