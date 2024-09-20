import React from "react";
import { ReceiptItem } from "@/data/receiptTypes";

interface ReadOnlySplitTableProps {
  receiptItems: ReceiptItem[];
  groupMembers: string[];
  splitData: Record<string, Set<number>>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export default function ReadOnlySplitTable({
  receiptItems,
  groupMembers,
  splitData,
  subtotal,
  tax,
  tip,
  total,
}: ReadOnlySplitTableProps) {
  const colors = [
    "#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693",
    "#a059a0", "#5c53a5", "#4b8bbd", "#3c97b8", "#2d879f", "#1b658e"
  ];

  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-[#353B47]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-[#1A2535]">
              <th className="py-3 px-4 text-left font-medium text-white">Item</th>
              <th className="py-3 px-4 text-left font-medium text-white">Price</th>
              {groupMembers.map((member, index) => {
                const color = colors[index % colors.length];
                return (
                  <th
                    key={member}
                    className="py-3 px-4 text-center font-medium text-white"
                    style={{ backgroundColor: color, color: "#000" }}
                  >
                    {member}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {receiptItems.map((item) => (
              <tr key={item.id} className="border-t border-gray-600 hover:bg-[#4A4F5C]">
                <td className="py-3 px-4 text-start">{item.item}</td>
                <td className="py-3 px-4 text-start">${item.price.toFixed(2)}</td>
                {groupMembers.map((member, index) => {
                  const color = colors[index % colors.length];
                  return (
                    <td
                      key={member}
                      className="py-3 px-4 text-center"
                      style={{ backgroundColor: color, color: "#000" }}
                    >
                      <input
                        type="checkbox"
                        checked={splitData[member]?.has(item.id) || false}
                        readOnly
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Display Subtotal, Tax, Tip, and Total */}
      <div className="px-8 py-2 bg-gray-700 text-white text-xl">
        <p className="mb-2 text-right">
          Subtotal: <span>${subtotal.toFixed(2)}</span>
        </p>
        <p className="mb-2 text-right">
          Tax: <span>${tax.toFixed(2)}</span>
        </p>
        <p className="mb-2 text-right">
          Tip: <span>${tip.toFixed(2)}</span>
        </p>
        <p className="font-bold text-right">
          Total: <span>${total.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
