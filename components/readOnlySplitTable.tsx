import React, { useState, useEffect } from "react";
import { ReceiptItem } from "@/data/receiptTypes";
import { FiCheck } from "react-icons/fi";

interface ReadOnlySplitTableProps {
  receiptItems: ReceiptItem[];
  groupMembers: string[];
  splitData: Record<string, Set<number>>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

// Custom colored checkbox component
const ColoredCheckbox = ({ 
  isChecked, 
  color 
}: { 
  isChecked: boolean; 
  color: string; 
}) => {
  return (
    <div className="flex justify-center">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          isChecked 
            ? 'border-white shadow-lg' 
            : 'border-gray-400 bg-white/20'
        }`}
        style={{
          backgroundColor: isChecked ? color : undefined,
        }}
      >
        {isChecked && (
          <FiCheck className="w-3 h-3 text-white font-bold" />
        )}
      </div>
    </div>
  );
};

export default function ReadOnlySplitTable({
  receiptItems,
  groupMembers,
  splitData,
  subtotal,
  tax,
  tip,
  total,
}: ReadOnlySplitTableProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colors = [
    "#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693",
    "#a059a0", "#5c53a5", "#4b8bbd", "#3c97b8", "#2d879f", "#1b658e"
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        {receiptItems.map((item) => (
          <div key={item.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-white font-medium text-lg">{item.item}</h3>
              <span className="text-white/90 font-semibold">${item.price.toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {groupMembers.map((member, index) => {
                const color = colors[index % colors.length];
                const isChecked = splitData[member]?.has(item.id) || false;
                
                return (
                  <div key={member} className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                    <ColoredCheckbox isChecked={isChecked} color={color} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: color }}
                    >
                      {member}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Mobile Summary */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg mt-6">
          <div className="space-y-2 text-white">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tip:</span>
              <span className="font-semibold">${tip.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-white/5 backdrop-blur-sm">
              <th className="py-4 px-6 text-left font-semibold text-white">Item</th>
              <th className="py-4 px-6 text-left font-semibold text-white">Price</th>
              {groupMembers.map((member, index) => {
                const color = colors[index % colors.length];
                return (
                  <th
                    key={member}
                    className="py-4 px-6 text-center font-semibold text-white border-l border-white/10"
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span style={{ color: color }}>{member}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {receiptItems.map((item, itemIndex) => (
              <tr 
                key={item.id} 
                className={`border-t border-white/10 hover:bg-white/5 transition-colors duration-200 ${
                  itemIndex % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                }`}
              >
                <td className="py-4 px-6 text-left font-medium">{item.item}</td>
                <td className="py-4 px-6 text-left font-semibold">${item.price.toFixed(2)}</td>
                {groupMembers.map((member, index) => {
                  const color = colors[index % colors.length];
                  const isChecked = splitData[member]?.has(item.id) || false;
                  
                  return (
                    <td key={member} className="py-4 px-6 text-center border-l border-white/10">
                      <ColoredCheckbox isChecked={isChecked} color={color} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border-t border-white/10">
        <div className="flex justify-end">
          <div className="space-y-2 text-white min-w-48">
            <div className="flex justify-between">
              <span className="text-white/80">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Tax:</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Tip:</span>
              <span className="font-semibold">${tip.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
