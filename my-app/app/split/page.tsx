"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SplitTable from "@/components/splitTable";

// Define types for receipt items and group members
interface ReceiptItem {
  id: number;
  item: string;
  price: number;
}

export default function SplitPage() {
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const searchParams = useSearchParams();

  // Parse receipt data passed from query parameters
  useEffect(() => {
    const receiptDataString = searchParams.get("data");
    if (receiptDataString) {
      const parsedData = JSON.parse(receiptDataString);
      setReceiptItems(parsedData.items);
    }
  }, [searchParams]);

  // Toggle the split status for an item and group member
  const handleToggleSplit = (itemId: number, memberName: string) => {
    console.log(`Item ${itemId} split with ${memberName}`);
    // Logic for updating the split status can be implemented here
  };

  // Add a new group member
  const handleAddMember = (newMember: string) => {
    setGroupMembers([...groupMembers, newMember]);
  };

  // Remove a group member
  const handleRemoveMember = (memberName: string) => {
    setGroupMembers(groupMembers.filter((member) => member !== memberName));
  };

  // Rename a group member
  const handleRenameMember = (oldName: string, newName: string) => {
    setGroupMembers(
      groupMembers.map((member) => (member === oldName ? newName : member))
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20">
      <h2 className="text-white text-2xl font-bold mb-6">Split Items</h2>

      {receiptItems.length > 0 ? (
        <SplitTable
          receiptItems={receiptItems}
          groupMembers={groupMembers}
          onToggleSplit={handleToggleSplit}
          onRemoveMember={handleRemoveMember}
          onRenameMember={handleRenameMember}
        />
      ) : (
        <p className="text-gray-400">No receipt data available.</p>
      )}

      {/* Section to add new group members */}
      <div className="my-6">
        <input
          type="text"
          placeholder="Add new group member"
          className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const newMember = (e.target as HTMLInputElement).value.trim();
              if (newMember) {
                handleAddMember(newMember);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
      </div>
    </div>
  );
}
