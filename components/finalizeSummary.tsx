import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

    navigator.clipboard.writeText(summaryText).then(() => {
      toast.success("Summary copied to clipboard!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "dark",
      });
    });
  };

  const totalAmount = groupMembers.reduce(
    (sum, member) => sum + (memberOwedAmounts[member] || 0),
    0
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-green-400">💰</span>
          Split Summary
        </h3>
        <p className="text-gray-400">Here's what everyone owes</p>
      </div>

      {/* Total Amount Display */}
      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
        <p className="text-green-300 text-sm font-medium">Total Amount</p>
        <p className="text-green-400 text-3xl font-bold">${totalAmount.toFixed(2)}</p>
      </div>

      {/* Member Amounts */}
      <div className="grid gap-3">
        {groupMembers.map((member, index) => {
          const amount = memberOwedAmounts[member] || 0;
          const colors = [
            'from-green-400 to-emerald-500',
            'from-blue-400 to-cyan-500', 
            'from-purple-400 to-violet-500',
            'from-pink-400 to-rose-500',
            'from-yellow-400 to-orange-500',
            'from-indigo-400 to-blue-500',
            'from-red-400 to-pink-500',
            'from-teal-400 to-green-500',
            'from-orange-400 to-red-500',
            'from-cyan-400 to-blue-500'
          ];
          const gradientClass = colors[index % colors.length];
          
          return (
            <div 
              key={member}
              className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {member.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium text-lg">{member}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${amount.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">
                  {((amount / totalAmount) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-200 font-medium shadow-lg hover:shadow-green-400/25 flex items-center justify-center gap-2"
          onClick={handleCopy}
        >
          <span>📋</span>
          Copy Summary
        </button>
        
        <button
          className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/15 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          onClick={() => window.print()}
        >
          <span>🖨️</span>
          Print
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}
