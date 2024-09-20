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
    <div className="flex flex-col items-center relative z-10 mt-20 pt-20 px-4">
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-4 relative z-10">
        Past Splits
      </div>

      {/* Action buttons for selecting and deleting expenses */}
      <div className="flex justify-start w-full max-w-screen-lg mx-auto mb-6">
        {/* Select/Cancel Button */}
        <button
          onClick={toggleSelectMode}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
        >
          {isSelectMode ? "Cancel" : "Select"}
        </button>

        {/* Trash Button: Only visible when in select mode and at least one expense is selected */}
        {isSelectMode && selectedExpenses.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
          >
            <FaTrashAlt className="mr-2" /> Delete
          </button>
        )}

        {/* Dropdown to select sort order (Newest/Oldest) */}
        <div className="ml-auto">
          <label htmlFor="sortOrder" className="text-white mr-2">
            Sort By:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) =>
              sortExpenses(e.target.value as "Newest" | "Oldest")
            }
            className="bg-gray-700 text-white px-2 py-2 rounded-lg"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Expenses Display Section */}
      <div className="max-w-screen-lg mx-auto w-full">
        {expenses.length === 0 ? (
          <p className="text-white text-center">No past splits found.</p> // Show message if no expenses exist
        ) : (
          <div
            className="bg-[#1F2A3D] p-6 rounded-lg shadow-lg"
            style={{ transition: "height 0.3s ease-in-out" }} // Smooth height transition
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`relative bg-gray-800 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-gray-700 border border-green-400 group ${
                    isSelectMode ? "cursor-default" : ""
                  } flex flex-col items-center`}
                  onClick={() => handleExpenseClick(expense.id!)}
                >
                  {/* Checkbox for selection (only in select mode) */}
                  {isSelectMode && (
                    <input
                      type="checkbox"
                      className="absolute top-3 left-3 w-5 h-5"
                      checked={selectedExpenses.includes(expense.id!)}
                      onChange={() => handleSelectExpense(expense.id!)}
                    />
                  )}

                  {/* Display the date of the expense */}
                  <p className="text-lg font-semibold mb-2 text-center">
                    {expense.createdAt instanceof Date
                      ? expense.createdAt.toLocaleDateString() // Format date if valid
                      : "Unknown Date"}
                  </p>

                  {/* Display the receipt image if available */}
                  {expense.receiptUrl ? (
                    <Image
                      src={expense.receiptUrl}
                      alt="Receipt"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover w-[200px] h-[200px]"
                      style={{ objectFit: "cover" }} // Ensure correct image cropping
                    />
                  ) : (
                    <p className="text-gray-400">No receipt available</p> // Fallback if no image
                  )}

                  {/* Hover effect to show participants if not in select mode */}
                  {!isSelectMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                      <p className="font-bold text-center mb-2">
                        Participants: {expense.splitDetails.length}
                      </p>
                      <ul className="mb-4">
                        {expense.splitDetails.map((participant) => (
                          <li key={participant.name} className="text-center">
                            {participant.name}
                          </li>
                        ))}
                      </ul>
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
