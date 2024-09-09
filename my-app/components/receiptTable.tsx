export default function ReceiptTable({
  receiptItems,
  subtotal,
  tax,
  total,
  onToggleSplit,
}: {
  receiptItems: any[];
  subtotal: number;
  tax: number;
  total: number;
  onToggleSplit: (id: number) => void;
}) {
  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-[#353B47]">
      <table className="min-w-full text-white">
        <thead>
          <tr className="bg-[#1A2535]">
            <th className="py-3 px-4 text-left font-medium text-white">Item</th>
            <th className="py-3 px-4 text-left font-medium text-white">Price</th>
            <th className="py-3 px-4 text-center font-medium text-white">
              Split?
            </th>
          </tr>
        </thead>
        <tbody>
          {receiptItems.map((item) => (
            <tr
              key={item.id}
              className="border-t border-gray-600 hover:bg-[#4A4F5C]"
            >
              <td className="py-3 px-4">{item.item}</td>
              <td className="py-3 px-4">${item.price.toFixed(2)}</td>
              <td className="py-3 px-4 text-center">
                <input
                  type="checkbox"
                  checked={item.split}
                  onChange={() => onToggleSplit(item.id)}
                  className="w-5 h-5 text-[#35B2EB] border-[#35B2EB] rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Line separator */}
      <hr className="my-4 border-t border-gray-500" />

      {/* Display Subtotal, Tax, and Total */}
      <div className="px-4 py-2 text-white text-lg">
        <p className="mb-2">Subtotal: ${subtotal.toFixed(2)}</p>
        <p className="mb-2">Tax: ${tax.toFixed(2)}</p>
        <p className="font-bold">Total: ${total.toFixed(2)}</p>
      </div>
    </div>
  );
}
