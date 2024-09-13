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
  onRemoveMember: (memberName: string) => void;
  onRenameMember: (oldName: string, newName: string) => void;
}

export default function SplitTable({
  receiptItems,
  groupMembers,
  onToggleSplit,
  onRemoveMember,
  onRenameMember,
}: SplitTableProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");

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
      <table className="min-w-full text-white">
        <thead>
          <tr className="bg-[#1A2535]">
            <th className="py-3 px-4 text-left font-medium text-white">Item</th>
            <th className="py-3 px-4 text-left font-medium text-white">Price</th>
            {groupMembers.map((member) => (
              <th key={member} className="py-3 px-4 text-center font-medium text-white">
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
                    <button onClick={() => setEditingMember(member)}>
                      <FaEdit className="text-yellow-500 ml-2" />
                    </button>
                    <button onClick={() => onRemoveMember(member)}>
                      <FaTimes className="text-red-500 ml-2" />
                    </button>
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {receiptItems.map((item) => (
            <tr key={item.id} className="border-t border-gray-600 hover:bg-[#4A4F5C]">
              <td className="py-3 px-4">{item.item}</td>
              <td className="py-3 px-4">${item.price.toFixed(2)}</td>
              {groupMembers.map((member) => (
                <td key={member} className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    onChange={() => onToggleSplit(item.id, member)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
