import React from "react";
import { toast } from "react-toastify";

interface ReceiptItem {
  id: number;
  item: string;
  price: number;
}

interface FinalizeSummaryProps {
  receiptItems: ReceiptItem[];
  groupMembers: string[];
  splitData: Record<string, Set<number>>;
}

export default function FinalizeSummary({
  receiptItems,
  groupMembers,
  splitData,
}: FinalizeSummaryProps) {
  const memberOwedAmounts: Record<string, number> = {};

  // Calculate how much each member owes
  receiptItems.forEach((item) => {
    const membersSharingItem = groupMembers.filter(
      (member) => splitData[member]?.has(item.id)
    );

    const splitCost = item.price / membersSharingItem.length;

    membersSharingItem.forEach((member) => {
      memberOwedAmounts[member] = (memberOwedAmounts[member] || 0) + splitCost;
    });
  });

  const handleCopy = () => {
    const summaryText = groupMembers
      .map((member) => `${member}: $${memberOwedAmounts[member].toFixed(2)}`)
      .join("\n");

    navigator.clipboard.writeText(summaryText);

    // Trigger a toast notification instead of an alert
    toast.success("Summary copied to clipboard!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="mt-6">
      <h3 className="text-white text-xl font-bold mb-4">Who Owes What</h3>
      <div className="bg-gray-800 text-white p-4 rounded-lg">
        {groupMembers.map((member) => (
          <p key={member}>
            {member}: ${memberOwedAmounts[member]?.toFixed(2) || "0.00"}
          </p>
        ))}
      </div>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
        onClick={handleCopy}
      >
        Copy Summary
      </button>
    </div>
  );
}
