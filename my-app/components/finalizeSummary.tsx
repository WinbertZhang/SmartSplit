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
  tax: number;
  subtotal: number;
  total: number;
}

export default function FinalizeSummary({
  receiptItems,
  groupMembers,
  splitData,
  tax,
  subtotal,
  total,
}: FinalizeSummaryProps) {
  const memberOwedAmounts: Record<string, number> = {};

  receiptItems.forEach((item) => {
    const membersSharingItem = groupMembers.filter(
      (member) => splitData[member]?.has(item.id)
    );
    const splitCost = item.price / membersSharingItem.length;
    membersSharingItem.forEach((member) => {
      memberOwedAmounts[member] = (memberOwedAmounts[member] || 0) + splitCost;
    });
  });

  // Calculate each member's share of the tax proportionally based on the subtotal they owe
  const memberOwedWithTax: Record<string, number> = {};
  Object.keys(memberOwedAmounts).forEach((member) => {
    const memberSubtotalShare = memberOwedAmounts[member];
    const memberTaxShare = (memberSubtotalShare / subtotal) * tax;
    memberOwedWithTax[member] = memberSubtotalShare + memberTaxShare;
  });

  const handleCopy = () => {
    const summaryText = groupMembers
      .map(
        (member) =>
          `${member}: $${memberOwedWithTax[member]?.toFixed(2) || "0.00"}`
      )
      .join("\n");

    navigator.clipboard.writeText(summaryText);

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
          {member}: ${memberOwedWithTax[member]?.toFixed(2) || "0.00"}
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
