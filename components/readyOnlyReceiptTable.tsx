import React, { useState, useEffect } from "react";

interface ReceiptViewTableProps {
  receiptItems: any[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  onToggleSplit?: (id: number) => void;
}

export default function ReceiptViewTable({
  receiptItems,
  subtotal,
  tax,
  tip,
  total,
  onToggleSplit,
}: ReceiptViewTableProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="space-y-4">
        {receiptItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg cursor-pointer hover:bg-white/15 transition-all duration-200"
            onClick={() => onToggleSplit?.(item.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium text-lg">{item.item}</h3>
              <span className="text-white/90 font-semibold text-lg">${item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
        
        {/* Mobile Summary */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg mt-6">
          <div className="space-y-3 text-white">
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
            <div className="border-t border-white/20 pt-3 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-400">${total.toFixed(2)}</span>
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
            </tr>
          </thead>
          <tbody>
            {receiptItems.map((item, index) => (
              <tr
                key={item.id}
                className={`border-t border-white/10 hover:bg-white/10 transition-colors duration-200 cursor-pointer ${
                  index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                }`}
                onClick={() => onToggleSplit?.(item.id)}
              >
                <td className="py-4 px-6 text-left font-medium">{item.item}</td>
                <td className="py-4 px-6 text-left font-semibold">${item.price.toFixed(2)}</td>
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
