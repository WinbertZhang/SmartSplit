import React from "react";

interface FinalizeSummaryProps {
  groupMembers: string[];
  memberOwedAmounts: Record<string, number>;
}

export default function FinalizeSummary({
  groupMembers,
  memberOwedAmounts,
}: FinalizeSummaryProps) {
  const handleCopy = () => {
    const summaryText = groupMembers
      .map(
        (member) =>
          `${member}: $${memberOwedAmounts[member]?.toFixed(2) || "0.00"}`
      )
      .join("\n");

    navigator.clipboard.writeText(summaryText);
    alert("Summary copied to clipboard!");
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
