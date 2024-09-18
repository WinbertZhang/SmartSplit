import React from "react";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify for notifications
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS for styling

interface FinalizeSummaryProps {
  groupMembers: string[];
  memberOwedAmounts: Record<string, number>;
}

export default function FinalizeSummary({
  groupMembers,
  memberOwedAmounts,
}: FinalizeSummaryProps) {
  // Function to handle copying the summary to the clipboard
  const handleCopy = () => {
    const summaryText = groupMembers
      .map(
        (member) =>
          `${member}: $${memberOwedAmounts[member]?.toFixed(2) || "0.00"}`
      )
      .join("\n");

    navigator.clipboard.writeText(summaryText).then(() => {
      // Show a toast notification when the text is copied successfully
      toast.success("Summary copied to clipboard!", {
        position: "top-right",
        autoClose: 3000, // Auto-close after 3 seconds
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "dark", // Set a dark theme to match your app's style
      });
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

      {/* Button to copy the summary */}
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
        onClick={handleCopy}
      >
        Copy Summary
      </button>

      {/* ToastContainer to show toast notifications */}
      <ToastContainer />
    </div>
  );
}
