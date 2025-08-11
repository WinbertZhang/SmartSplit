import React, { useEffect, useState } from "react";
import { FaTimes, FaEdit, FaCheck } from "react-icons/fa";
import { ReceiptItem } from "@/data/receiptTypes";

interface SplitTableProps {
  receiptItems: ReceiptItem[];
  groupMembers: string[];
  onToggleSplit: (itemId: number, memberName: string) => void;
  splitData: Record<string, Set<number>>;
  onRemoveMember: (memberName: string) => void;
  onRenameMember: (oldName: string, newName: string) => void;
  onFinalizeDisabledChange: (disabled: boolean) => void;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export default function SplitTable({
  receiptItems,
  groupMembers,
  onToggleSplit,
  splitData,
  onRemoveMember,
  onRenameMember,
  onFinalizeDisabledChange,
  subtotal,
  tax,
  tip,
  total,
}: SplitTableProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Consistent color scheme that matches FinalizeSummary
  const memberColors = [
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const allRowsHaveAtLeastOneMember = receiptItems.every((item) =>
      groupMembers.some((member) => splitData[member]?.has(item.id))
    );
    onFinalizeDisabledChange(!allRowsHaveAtLeastOneMember);
  }, [receiptItems, groupMembers, splitData, onFinalizeDisabledChange]);

  const handleRename = (oldName: string) => {
    if (newMemberName.trim()) {
      onRenameMember(oldName, newMemberName.trim());
      setEditingMember(null);
      setNewMemberName("");
    }
  };

  const handleToggleAll = (member: string) => {
    const hasAnyItems = receiptItems.some((item) => splitData[member]?.has(item.id));
    
    receiptItems.forEach((item) => {
      if (hasAnyItems && splitData[member]?.has(item.id)) {
        onToggleSplit(item.id, member); // Clear all
      } else if (!hasAnyItems && !splitData[member]?.has(item.id)) {
        onToggleSplit(item.id, member); // Select all
      }
    });
  };

  const handleToggleAllForItem = (itemId: number) => {
    const allMembersSelected = groupMembers.every((member) =>
      splitData[member]?.has(itemId)
    );

    groupMembers.forEach((member) => {
      if (allMembersSelected) {
        if (splitData[member]?.has(itemId)) {
          onToggleSplit(itemId, member);
        }
      } else {
        if (!splitData[member]?.has(itemId)) {
          onToggleSplit(itemId, member);
        }
      }
    });
  };

  // Custom checkbox component with member colors
  const ColoredCheckbox = ({ checked, onChange, memberIndex }: { 
    checked: boolean; 
    onChange: () => void; 
    memberIndex: number;
  }) => {
    const gradientClass = memberColors[memberIndex % memberColors.length];
    
    return (
      <button
        onClick={onChange}
        className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
          checked 
            ? `bg-gradient-to-r ${gradientClass} border-transparent shadow-lg` 
            : 'border-white/30 bg-white/10 hover:border-white/50'
        }`}
      >
        {checked && <FaCheck className="text-white text-xs" />}
      </button>
    );
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-4">
        
        {/* Group Members Header */}
        <div className="space-y-3">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <span className="text-blue-400">👥</span>
            Group Members ({groupMembers.length})
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {groupMembers.map((member, index) => {
              const gradientClass = memberColors[index % memberColors.length];
              const hasAnyItems = receiptItems.some((item) => splitData[member]?.has(item.id));
              
              return (
                <div 
                  key={member}
                  className="bg-white/10 border border-white/20 rounded-xl p-3 flex items-center gap-3 min-w-0 flex-1"
                >
                  {editingMember === member ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter name"
                        className="bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleRename(member)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <FaCheck className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`w-8 h-8 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                        {member.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm truncate flex-1">{member}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleAll(member)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            hasAnyItems 
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          }`}
                        >
                          {hasAnyItems ? 'Clear' : 'All'}
                        </button>
                        <button 
                          onClick={() => {
                            setEditingMember(member);
                            setNewMemberName(member);
                          }}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        {groupMembers.length > 1 && (
                          <button 
                            onClick={() => onRemoveMember(member)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <span className="text-green-400">🧾</span>
            Receipt Items
          </h3>
          
          {receiptItems.map((item) => {
            const allMembersSelected = groupMembers.every((member) =>
              splitData[member]?.has(item.id)
            );
            
            return (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                
                {/* Item Header */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.item}</h4>
                    <p className="text-green-400 font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleToggleAllForItem(item.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      allMembersSelected 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                        : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                    }`}
                  >
                    {allMembersSelected ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                {/* Member Selection */}
                <div className="grid grid-cols-2 gap-2">
                  {groupMembers.map((member, memberIndex) => {
                    const isSelected = splitData[member]?.has(item.id) || false;
                    const gradientClass = memberColors[memberIndex % memberColors.length];
                    
                    return (
                      <button
                        key={member}
                        onClick={() => onToggleSplit(item.id, member)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-white/15 border-white/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <ColoredCheckbox 
                          checked={isSelected}
                          onChange={() => onToggleSplit(item.id, member)}
                          memberIndex={memberIndex}
                        />
                        <div className={`w-6 h-6 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {member.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium truncate">{member}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-2">
          <h3 className="text-white text-lg font-semibold mb-3">Receipt Totals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tax:</span>
              <span className="text-white font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tip:</span>
              <span className="text-white font-medium">${tip.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-green-400 font-bold text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-white/10">
                <th className="py-4 px-6 text-left font-semibold text-white">Item</th>
                <th className="py-4 px-6 text-left font-semibold text-white">Price</th>
                <th className="py-4 px-6 text-center font-semibold text-white">All</th>
                {groupMembers.map((member, index) => {
                  const gradientClass = memberColors[index % memberColors.length];
                  const hasAnyItems = receiptItems.some((item) => splitData[member]?.has(item.id));
                  
                  return (
                    <th key={member} className="py-4 px-4 text-center font-semibold text-white relative group">
                      {editingMember === member ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Enter name"
                            className="bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-400"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleRename(member)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <FaCheck className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-6 h-6 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                              {member.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">{member}</span>
                          </div>
                          
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleAll(member)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                hasAnyItems 
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                              }`}
                            >
                              {hasAnyItems ? 'Clear' : 'All'}
                            </button>
                            
                            <div className="hidden group-hover:flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingMember(member);
                                  setNewMemberName(member);
                                }}
                                className="text-yellow-400 hover:text-yellow-300 p-1"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              {groupMembers.length > 1 && (
                                <button 
                                  onClick={() => onRemoveMember(member)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                              )}
                            </div>
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
                <tr key={item.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-medium">{item.item}</td>
                  <td className="py-4 px-6 text-green-400 font-semibold">${item.price.toFixed(2)}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleToggleAllForItem(item.id)}
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        groupMembers.every((member) => splitData[member]?.has(item.id))
                          ? 'bg-blue-500 border-blue-500 shadow-lg' 
                          : 'border-white/30 bg-white/10 hover:border-white/50'
                      }`}
                    >
                      {groupMembers.every((member) => splitData[member]?.has(item.id)) && 
                        <FaCheck className="text-white text-xs" />
                      }
                    </button>
                  </td>
                  {groupMembers.map((member, memberIndex) => (
                    <td key={member} className="py-4 px-4 text-center">
                      <ColoredCheckbox 
                        checked={splitData[member]?.has(item.id) || false}
                        onChange={() => onToggleSplit(item.id, member)}
                        memberIndex={memberIndex}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="bg-white/10 px-6 py-4 border-t border-white/10">
          <div className="flex justify-end">
            <div className="space-y-2 text-right min-w-48">
              <div className="flex justify-between gap-8">
                <span className="text-gray-300">Subtotal:</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-300">Tax:</span>
                <span className="text-white font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-300">Tip:</span>
                <span className="text-white font-medium">${tip.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 mt-2">
                <div className="flex justify-between gap-8">
                  <span className="text-white font-semibold text-lg">Total:</span>
                  <span className="text-green-400 font-bold text-xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
