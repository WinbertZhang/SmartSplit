"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SplitTable from "@/components/splitTable";
import FinalizeSummary from "@/components/finalizeSummary";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 

interface ReceiptItem {
  id: number;
  item: string;
  price: number;
}

export default function SplitPage() {
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({});
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [finalizeDisabled, setFinalizeDisabled] = useState<boolean>(false); // Control for disabling Finalize button
  const searchParams = useSearchParams();

  // Parse receipt data passed from query parameters
  useEffect(() => {
    const receiptDataString = searchParams.get("data");
    if (receiptDataString) {
      const parsedData = JSON.parse(receiptDataString);
      setReceiptItems(parsedData.items);
    }
  }, [searchParams]);

  // Mark changes and enable Finalize button
  const handleAnyChange = () => {
    setFinalizeDisabled(false); // Enable the button when any change happens
    setShowSummary(false); // Hide the summary until finalized again
  };

  // Toggle the split status for an item and group member
  const handleToggleSplit = (itemId: number, memberName: string) => {
    setSplitData((prevData) => {
      const updatedData = { ...prevData };

      // Create a new Set for this member to ensure immutability
      const memberSet = new Set(updatedData[memberName] || []);

      if (memberSet.has(itemId)) {
        memberSet.delete(itemId); // Uncheck (remove) item from the set
      } else {
        memberSet.add(itemId); // Check (add) item to the set
      }

      updatedData[memberName] = memberSet; // Update the member's set

      handleAnyChange(); // Mark change and enable Finalize

      return updatedData; // Return new state
    });
  };

  // Add a new group member
  const handleAddMember = (newMember: string) => {
    if (groupMembers.length >= 10) {
      toast.error("You can't add more than 10 members!");
      return;
    }
    setGroupMembers([...groupMembers, newMember]);
    handleAnyChange(); // Mark change and enable Finalize
  };

  // Remove a group member
  const handleRemoveMember = (memberName: string) => {
    setGroupMembers(groupMembers.filter((member) => member !== memberName));
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[memberName];
      handleAnyChange(); // Mark change and enable Finalize
      return updatedData;
    });
  };

  // Rename a group member
  const handleRenameMember = (oldName: string, newName: string) => {
    setGroupMembers((prevMembers) =>
      prevMembers.map((member) => (member === oldName ? newName : member))
    );
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[newName] = updatedData[oldName];
      delete updatedData[oldName];
      handleAnyChange(); // Mark change and enable Finalize
      return updatedData;
    });
  };

  // Finalize the split and show summary
  const handleFinalize = () => {
    setShowSummary(true); // Show summary
    setFinalizeDisabled(true); // Disable the finalize button
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20">
      <h2 className="text-white text-2xl font-bold mb-6">Split Items</h2>

      {receiptItems.length > 0 ? (
        <>
          <SplitTable
            receiptItems={receiptItems}
            groupMembers={groupMembers}
            onToggleSplit={handleToggleSplit}
            splitData={splitData}
            onRemoveMember={handleRemoveMember}
            onRenameMember={handleRenameMember}
          />
          <button
            onClick={handleFinalize}
            className={`text-white px-4 py-2 mt-4 rounded-lg ${
              finalizeDisabled
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={finalizeDisabled}
          >
            Finalize
          </button>
        </>
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

      {/* Show FinalizeSummary only after finalization */}
      {showSummary && (
        <FinalizeSummary
          receiptItems={receiptItems}
          groupMembers={groupMembers}
          splitData={splitData}
        />
      )}

      <ToastContainer />
    </div>
  );
}
