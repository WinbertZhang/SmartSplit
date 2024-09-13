import React, { useEffect, useState } from "react";
import { FaTimes, FaEdit } from "react-icons/fa";

// Define types for the props
interface ReceiptItem {
  id: number;
  item: string;
  price: number;
}

interface SplitTableProps {
  receiptItems: ReceiptItem[];
  groupMembers: string[];
  onToggleSplit: (itemId: number, memberName: string) => void;
  splitData: Record<string, Set<number>>;
  onRemoveMember: (memberName: string) => void;
  onRenameMember: (oldName: string, newName: string) => void;
  onFinalizeDisabledChange: (disabled: boolean) => void; // Added to notify parent about button state
  subtotal: number;
  tax: number;
  total: number;
}

export default function SplitTable({
  receiptItems,
  groupMembers,
  onToggleSplit,
  splitData,
  onRemoveMember,
  onRenameMember,
  onFinalizeDisabledChange, // Added for disabling the finalize button
  subtotal,
  tax,
  total,
}: SplitTableProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});

  const colors = [
    "#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693",
    "#a059a0", "#5c53a5", "#4b8bbd", "#3c97b8", "#2d879f", "#1b658e"
  ];

  useEffect(() => {
    // Initialize toggle states for each member
    const initialToggles = groupMembers.reduce((acc, member) => {
      acc[member] = false; // Start with "Select All" state
      return acc;
    }, {} as Record<string, boolean>);
    setToggleStates(initialToggles);
  }, [groupMembers]);

  useEffect(() => {
    // Check if all rows for each member are filled
    const allRowsHaveAtLeastOneMember = receiptItems.every((item) =>
      groupMembers.some((member) => splitData[member]?.has(item.id))
    );
    // Notify parent component whether finalize should be disabled
    onFinalizeDisabledChange(!allRowsHaveAtLeastOneMember);
  }, [receiptItems, groupMembers, splitData, onFinalizeDisabledChange]);

  // Handle renaming a group member
  const handleRename = (oldName: string) => {
    if (newMemberName.trim()) {
      onRenameMember(oldName, newMemberName.trim());
      setEditingMember(null);
      setNewMemberName("");
    }
  };

  // Toggle between Select All and Clear All for a specific group member
  const handleToggleAll = (member: string) => {
    const selectAll = !toggleStates[member]; // Toggle state

    receiptItems.forEach((item) => {
      if (selectAll && !splitData[member]?.has(item.id)) {
        onToggleSplit(item.id, member); // Select All
      } else if (!selectAll && splitData[member]?.has(item.id)) {
        onToggleSplit(item.id, member); // Clear All
      }
    });

    setToggleStates((prevState) => ({
      ...prevState,
      [member]: selectAll,
    }));
  };

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
                    className="py-3 px-4 text-center font-medium text-white relative group"
                    style={{ backgroundColor: color, color: "#000" }}
                  >
                    {editingMember === member ? (
                      <div>
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Rename member"
                          className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
                        />
                        <button onClick={() => handleRename(member)}>
                          <FaEdit className="text-green-500" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        {member}
                        <div className="absolute right-0 top-0 hidden group-hover:flex space-x-2">
                          <button onClick={() => setEditingMember(member)}>
                            <FaEdit className="text-yellow-500" />
                          </button>
                          <button onClick={() => onRemoveMember(member)}>
                            <FaTimes className="text-red-500" />
                          </button>
                        </div>
                        <div className="mt-2 flex justify-center">
                          <input
                            type="checkbox"
                            checked={toggleStates[member]}
                            onChange={() => handleToggleAll(member)}
                          />
                        </div>
                      </div>
                    )}
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
                        onChange={() => onToggleSplit(item.id, member)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Display Subtotal, Tax, and Total */}
      <div className="px-8 py-2 bg-gray-700 text-white text-xl">
        <p className="mb-2 text-right">
          Subtotal: <span>${subtotal.toFixed(2)}</span>
        </p>
        <p className="mb-2 text-right">
          Tax: <span>${tax.toFixed(2)}</span>
        </p>
        <p className="font-bold text-right">
          Total: <span>${total.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
