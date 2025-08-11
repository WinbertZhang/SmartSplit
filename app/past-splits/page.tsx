"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig"; // Firebase authentication configuration
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"; // Firebase authentication state listener
import {
  fetchUserExpenses,
  deleteExpenseFromFirestore,
} from "@/lib/firebaseUtils"; // Fetch and delete utilities for Firestore
import { useRouter } from "next/navigation"; // Next.js router for navigation
import Image from "next/image"; // Optimized image handling in Next.js
import { ReceiptData } from "@/data/receiptTypes"; // Types for Receipt Data
import { FaTrashAlt } from "react-icons/fa"; // Trash can icon for delete button

export default function PastSplits() {
  // State to hold user, expenses, selected expenses, and UI states like select mode and sort order
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [expenses, setExpenses] = useState<ReceiptData[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]); // Tracks selected expenses for deletion
  const [isSelectMode, setIsSelectMode] = useState(false); // Toggles selection mode
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest"); // Controls the sorting of expenses
  const router = useRouter(); // Router for navigation between pages

  // Fetch expenses for the logged-in user from Firestore
  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        const userExpenses = await fetchUserExpenses(user.uid);
        const sortedExpenses = userExpenses.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        ); // Sort by Newest
        setExpenses(sortedExpenses); // Store fetched and sorted expenses in state
      }
    };

    fetchExpenses(); // Trigger expense fetching when user is set
  }, [user]);

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the user when authenticated
      } else {
        router.push("/login"); // Redirect to login page if not authenticated
      }
    });

    return () => unsubscribe(); // Clean up the listener when component unmounts
  }, [router]);

  // Function to sort expenses based on createdAt (either Newest or Oldest)
  const sortExpenses = (order: "Newest" | "Oldest") => {
    const sortedExpenses = [...expenses].sort((a, b) => {
      if (order === "Newest") {
        return b.createdAt.getTime() - a.createdAt.getTime(); // Newest first
      } else {
        return a.createdAt.getTime() - b.createdAt.getTime(); // Oldest first
      }
    });
    setExpenses(sortedExpenses); // Update state with sorted expenses
    setSortOrder(order); // Update sort order
  };

  // Handle click on individual expense, navigating to the detailed view if not in select mode
  const handleExpenseClick = (expenseId: string) => {
    if (!isSelectMode) {
      router.push(`/past-splits/${expenseId}`); // Navigate to individual expense page
    }
  };

  // Handle selecting/deselecting an expense for deletion
  const handleSelectExpense = (expenseId: string) => {
    setSelectedExpenses(
      (prevSelected) =>
        prevSelected.includes(expenseId)
          ? prevSelected.filter((id) => id !== expenseId) // Deselect if already selected
          : [...prevSelected, expenseId] // Add to selected list if not selected
    );
  };

  // Handle deletion of selected expenses from Firestore
  const handleDeleteSelected = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete the selected splits?"
    );
    if (confirmed) {
      try {
        // Delete each selected expense from Firestore
        await Promise.all(
          selectedExpenses.map((expenseId) =>
            deleteExpenseFromFirestore(expenseId)
          )
        );
        // Remove the deleted expenses from the UI
        setExpenses((prevExpenses) =>
          prevExpenses.filter(
            (expense) => !selectedExpenses.includes(expense.id!)
          )
        );
        setSelectedExpenses([]); // Clear selected expenses
        setIsSelectMode(false); // Exit select mode
      } catch (error) {
        console.error("Error deleting expenses:", error); // Handle errors during deletion
      }
    }
  };

  // Toggle selection mode on/off
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode); // Toggle the select mode state
    setSelectedExpenses([]); // Clear selected expenses when toggling mode
  };

  return (
    <div className="flex flex-col items-center relative z-10 pt-24 px-4 min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-6 relative z-10">
        Past Splits
      </div>

      {/* Action buttons for selecting and deleting expenses */}
      <div className="flex flex-wrap justify-between items-center w-full max-w-screen-lg mx-auto mb-8 gap-4">
        <div className="flex items-center space-x-4">
          {/* Select/Cancel Button */}
          <button
            onClick={toggleSelectMode}
            className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
              isSelectMode 
                ? "bg-red-500/20 border-red-400/50 text-red-400 hover:bg-red-500/30 hover:border-red-400" 
                : "bg-blue-500/20 border-blue-400/50 text-blue-400 hover:bg-blue-500/30 hover:border-blue-400"
            }`}
          >
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isSelectMode 
                ? "bg-gradient-to-r from-red-500/20 to-pink-500/20" 
                : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
            }`}></div>
            <span className="relative z-10">
              {isSelectMode ? "Cancel" : "Select"}
            </span>
          </button>

          {/* Trash Button: Only visible when in select mode and at least one expense is selected */}
          {isSelectMode && selectedExpenses.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="group relative bg-red-500/20 border border-red-400/50 text-red-400 px-6 py-3 rounded-xl hover:bg-red-500/30 hover:border-red-400 transition-all duration-300 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FaTrashAlt className="relative z-10" />
              <span className="relative z-10 font-medium">Delete ({selectedExpenses.length})</span>
            </button>
          )}
        </div>

        {/* Dropdown to select sort order (Newest/Oldest) */}
        <div className="flex items-center space-x-3">
          <label htmlFor="sortOrder" className="text-white/80 font-medium">
            Sort By:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) =>
              sortExpenses(e.target.value as "Newest" | "Oldest")
            }
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          >
            <option value="Newest" className="bg-gray-800">Newest</option>
            <option value="Oldest" className="bg-gray-800">Oldest</option>
          </select>
        </div>
      </div>

      {/* Expenses Display Section */}
      <div className="max-w-screen-lg mx-auto w-full">
        {expenses.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-white text-xl font-semibold mb-2">No Past Splits Found</h3>
            <p className="text-white/60">Upload a receipt to get started with your first split!</p>
          </div>
        ) : (
          <div
            className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10"
            style={{ transition: "height 0.3s ease-in-out" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`group relative bg-white/10 backdrop-blur-lg text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-white/20 border border-white/20 hover:border-purple-400/50 transition-all duration-300 flex flex-col items-center ${
                    isSelectMode ? "cursor-default" : "hover:scale-105"
                  }`}
                  onClick={() => handleExpenseClick(expense.id!)}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Checkbox for selection (only in select mode) */}
                  {isSelectMode && (
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-400/50"
                        checked={selectedExpenses.includes(expense.id!)}
                        onChange={() => handleSelectExpense(expense.id!)}
                      />
                    </div>
                  )}

                  {/* Display the date of the expense */}
                  <div className="relative z-10 w-full mb-4">
                    <p className="text-lg font-semibold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {expense.createdAt instanceof Date
                        ? expense.createdAt.toLocaleDateString()
                        : "Unknown Date"}
                    </p>
                  </div>

                  {/* Display the receipt image if available */}
                  {expense.receiptUrl ? (
                    <div className="relative z-10 mb-4 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                      <Image
                        src={expense.receiptUrl}
                        alt="Receipt"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover w-full h-40 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative z-10 mb-4 w-full h-40 bg-white/5 rounded-xl border border-white/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-white/60 text-sm">No Image</p>
                      </div>
                    </div>
                  )}

                  {/* Display total if available */}
                  {expense.total && (
                    <div className="relative z-10 w-full mb-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                        <p className="text-center">
                          <span className="text-white/60 text-sm">Total: </span>
                          <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            ${expense.total.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Participants section - always visible with expand on hover */}
                  {!isSelectMode && expense.splitDetails && expense.splitDetails.length > 0 && (
                    <div className="relative z-20 w-full">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                        <p className="text-center text-white/80 text-sm font-medium mb-2">
                          👥 {expense.splitDetails.length} Participants
                        </p>
                        
                        {/* Expanded participant list on hover */}
                        <div className="max-h-0 overflow-hidden group-hover:max-h-32 transition-all duration-300 ease-in-out">
                          <div className="space-y-1 pt-2 border-t border-white/20">
                            {expense.splitDetails.map((participant, index) => (
                              <div key={participant.name} className="flex items-center justify-center space-x-2 text-xs">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ 
                                    backgroundColor: ["#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693", "#a059a0", "#5c53a5"][index % 7]
                                  }}
                                ></div>
                                <span className="text-white/90">{participant.name}</span>
                                <span className="text-white/60">${participant.amount?.toFixed(2) || '0.00'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
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
