import React, { useState } from "react";
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
}

export default function SplitTable({
  receiptItems,
  groupMembers,
  onToggleSplit,
  splitData,
  onRemoveMember,
  onRenameMember,
}: SplitTableProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");

  const colors = [
    "#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693",
    "#a059a0", "#5c53a5", "#4b8bbd", "#3c97b8", "#2d879f", "#1b658e"
  ];

  // Handle renaming a group member
  const handleRename = (oldName: string) => {
    if (newMemberName.trim()) {
      onRenameMember(oldName, newMemberName.trim());
      setEditingMember(null);
      setNewMemberName("");
    }
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
                        {/* Icons are hidden by default, visible on hover */}
                        <div className="absolute right-0 top-0 hidden group-hover:flex space-x-2">
                          <button onClick={() => setEditingMember(member)}>
                            <FaEdit className="text-yellow-500" />
                          </button>
                          <button onClick={() => onRemoveMember(member)}>
                            <FaTimes className="text-red-500" />
                          </button>
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
                <td className="py-3 px-4">{item.item}</td>
                <td className="py-3 px-4">${item.price.toFixed(2)}</td>
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
    </div>
  );
}
