interface ReceiptItem {
    id: number;
    item: string;
    price: number;
  }
  
  interface ReceiptTableProps {
    receiptItems: ReceiptItem[];
  }
  export default function ReceiptTable({ receiptItems = [] }: ReceiptTableProps) {
    if (!Array.isArray(receiptItems)) {
      return <p>No items to display</p>;
    }
  
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-orangeCustom">Items on Receipt</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-yellowCustom">
              <th className="py-2 text-orangeCustom">Item</th>
              <th className="py-2 text-orangeCustom">Price</th>
            </tr>
          </thead>
          <tbody>
            {receiptItems.map(({ id, item, price }) => (
              <tr key={id} className="border-b">
                <td className="py-2">{item}</td>
                <td className="py-2">${price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  