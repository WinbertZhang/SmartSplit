"use client"

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { fetchUserExpenses } from "@/lib/firebaseUtils"; // Import the utility function
import { useRouter } from "next/navigation"; // Use the `useRouter` from Next.js 14 app router
import Image from "next/image";
import { ReceiptData } from "@/data/receiptTypes"; // Import ReceiptData type

export default function PastSplits() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [expenses, setExpenses] = useState<ReceiptData[]>([]);
  const router = useRouter(); // For routing to individual expense pages

  // Fetch expenses for the logged-in user
  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        const userExpenses = await fetchUserExpenses(user.uid);
        setExpenses(userExpenses);
      }
    };

    fetchExpenses(); // Trigger fetch when user is set
  }, [user]);

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Redirect to login if not authenticated
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleExpenseClick = (expenseId: string) => {
    router.push(`/past-splits/${expenseId}`); // Navigate to individual expense page
  };

  return (
    <div className="flex flex-col items-center relative z-10 mt-20 pt-20">
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-4 relative z-10">
        Past Splits
      </div>

      {/* Expenses Display */}
      <div className="max-w-screen-lg mx-auto mt-6 w-full">
        {expenses.length === 0 ? (
          <p className="text-white text-center">No past splits found.</p>
        ) : (
          <div
            className="bg-[#1F2A3D] p-6 rounded-lg shadow-lg"
            style={{ transition: "height 0.3s ease-in-out" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-gray-800 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-gray-700"
                  onClick={() => handleExpenseClick(expense.id!)}
                >
                  <p className="text-lg font-semibold mb-2">
                    {expense.createdAt instanceof Date
                      ? expense.createdAt.toLocaleDateString()
                      : "Unknown Date"} {/* Display formatted date */}
                  </p>
                  {expense.receiptUrl ? (
                    <Image
                      src={expense.receiptUrl}
                      alt="Receipt"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-400">No receipt available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
