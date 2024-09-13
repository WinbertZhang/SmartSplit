"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  fetchUserGroups,
  fetchGroupExpenses,
  Group,
  Expense,
} from "@/lib/firebaseUtils";
import ReceiptViewTable from "@/components/receiptViewTable"; // Import the ReceiptTable component
import Image from "next/image";

export default function PastSplits() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch groups for the logged-in user
  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        const userGroups = await fetchUserGroups(user.uid);
        setGroups(userGroups);
      }
    };

    fetchGroups();
  }, [user]);

  // Fetch expenses for the selected group
  useEffect(() => {
    const fetchExpenses = async () => {
      if (selectedGroup) {
        const groupExpenses = await fetchGroupExpenses(selectedGroup);
        setExpenses(groupExpenses);
      }
    };

    fetchExpenses();
  }, [selectedGroup]);

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  // Open modal when an expense is clicked
  const openModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  // Function to toggle the "split" state of a receipt item
  const handleToggleSplit = (itemId: number) => {
    if (selectedExpense) {
      const updatedItems = selectedExpense.items.map((item) =>
        item.id === itemId ? { ...item, split: !item.split } : item
      );
      setSelectedExpense({ ...selectedExpense, items: updatedItems });
    }
  };

  return (
    <div className="flex flex-col items-center relative z-10 mt-20 pt-20">
      {/* Page Title */}
      <div className="text-center text-[2.5rem] leading-none sm:text-6xl tracking-tight font-bold text-white mb-4 relative z-10">
        Past Splits
      </div>

      {/* Group Selector */}
      <div className="text-white text-center">
        <h2 className="mt-4">Select a Group</h2>
        <select
          className="mt-2 p-2 bg-gray-800 text-white rounded"
          onChange={(e) => setSelectedGroup(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select Group
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.groupName}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Display */}
      <div className="max-w-screen-lg mx-auto mt-6 w-full">
        <h2 className="text-white text-2xl mb-4 text-center">Group Expenses</h2>

        {expenses.length === 0 ? (
          <p className="text-white text-center">No expenses yet</p>
        ) : (
          <div
            className="bg-[#1F2A3D] p-6 rounded-lg shadow-lg"
            style={{ transition: "height 0.3s ease-in-out" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-gray-800 text-white p-6 rounded-xl shadow-lg border-2 border-green-400 cursor-pointer"
                  onClick={() => openModal(expense)}
                >
                  <h3 className="text-lg font-semibold mb-2 ">
                    {expense.title}
                  </h3>
                  <p className="text-gray-400 mb-2">
                    Category: {expense.category}
                  </p>
                  <p className="text-gray-400">
                    Total:{" "}
                    <span className="text-green-400">
                      ${Number(expense.total).toFixed(2)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedExpense && (
  <div className="fixed inset-0 top-[76px] bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
    <div className="bg-white p-10 rounded-lg shadow-lg relative w-full max-w-3xl mx-auto overflow-y-auto" style={{ maxHeight: '80vh' }}>
      <button
        className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        onClick={closeModal}
      >
        X
      </button>

      {/* Receipt Information */}
      <h3 className="text-xl font-semibold mb-2">
        {selectedExpense.title}
      </h3>
      <p className="text-gray-600 mb-2">
        Category: {selectedExpense.category}
      </p>
      <p className="text-gray-600 mb-2">
        Group ID: {selectedExpense.groupId}
      </p>

      {/* Receipt Image */}
      {selectedExpense.receiptUrl && (
        <div className="mb-4">
          <Image
            src={selectedExpense.receiptUrl}
            alt="Receipt"
            width={400}
            height={400}
          />
        </div>
      )}

      {/* Display Receipt Table */}
      {selectedExpense.items && (
        <ReceiptViewTable
          receiptItems={selectedExpense.items}
          subtotal={selectedExpense.subtotal}
          tax={selectedExpense.tax} // Add actual tax calculation logic if needed
          total={Number(selectedExpense.total)}
          onToggleSplit={handleToggleSplit}
        />
      )}
    </div>
  </div>
)}


    </div>
  );
}
