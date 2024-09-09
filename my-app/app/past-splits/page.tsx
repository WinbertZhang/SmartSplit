"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  fetchUserGroups,
  fetchGroupExpenses,
  Group,
  Expense,
} from "@/lib/firestoreUtils";

export default function PastSplits() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
                  className="bg-gray-800 text-white p-6 rounded-xl shadow-lg border-2 border-green-400"
                >
                  <h3 className="text-lg font-semibold mb-2 ">
                    {expense.description}
                  </h3>
                  <p className="text-gray-400 mb-2">
                    Category: {expense.category}
                  </p>
                  <p className="text-gray-400">
                    Amount:{" "}
                    <span className="text-green-400">
                      ${Number(expense.amount).toFixed(2)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
