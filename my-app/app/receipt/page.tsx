"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Updated import
import UploadButton from "@/components/uploadButton";
import Image from "next/image";

// Define the structure of a receipt item with `id`
interface ReceiptItem {
  id: number;
  item: string;
  price: number;
  split: boolean; // New field to track whether the user wants to split the item
}

// Define the structure of the receipt data that will be returned
interface ReceiptData {
  items: ReceiptItem[];
}

// Receipt Table component with checkboxes for splitting
function ReceiptTable({
  receiptItems,
  onToggleSplit,
}: {
  receiptItems: ReceiptItem[];
  onToggleSplit: (id: number) => void;
}) {
  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white">
      <table className="min-w-full bg-white rounded-lg">
        <thead>
          <tr className="bg-yellow-100">
            <th className="py-3 px-4 text-left font-medium text-gray-700">Item</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Price</th>
            <th className="py-3 px-4 text-center font-medium text-gray-700">Split?</th>
          </tr>
        </thead>
        <tbody>
          {receiptItems.map((item) => (
            <tr key={item.id} className="border-t border-gray-200 hover:bg-yellow-50">
              <td className="py-3 px-4 text-gray-800">{item.item}</td>
              <td className="py-3 px-4 text-gray-800">${item.price.toFixed(2)}</td>
              <td className="py-3 px-4 text-center">
                <input
                  type="checkbox"
                  checked={item.split}
                  onChange={() => onToggleSplit(item.id)}
                  className="w-5 h-5 text-orange-600 border-orange-300 rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null); // Store image URL for display
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null); // Use ReceiptData type
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // Track if the panel is open
  const router = useRouter(); // Correct import

  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Create a temporary URL for the image preview
    setLoading(true);
    setPanelOpen(true); // Open the side panel when image is uploaded

    // Mock data to simulate receipt items instead of calling an API
    const mockReceiptData: ReceiptData = {
      items: [
        { id: 1, item: "Bounty Paper Towels", price: 2.99, split: false },
        { id: 2, item: "Organic Bananas", price: 1.5, split: false },
        { id: 3, item: "Milk", price: 3.49, split: false },
        { id: 4, item: "Bread", price: 2.29, split: false },
      ],
    };

    // Simulate a delay to mock API call processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setReceiptData(mockReceiptData);
    setLoading(false);
  };

  // Toggle the split status for an item
  const toggleSplit = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.map((item) =>
        item.id === id ? { ...item, split: !item.split } : item
      );
      setReceiptData({ items: updatedItems });
    }
  };

  // Handle submit and confirm
  const handleSubmit = () => {
    const confirmation = window.confirm("Are you sure you want to submit?");
    if (confirmation) {
      // Redirect to the dashboard after confirmation
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-50 p-6 relative">
      {/* Upload Receipt Section */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        {/* Gradient Banner for Upload Receipt */}
        <div
          className="p-4 text-white text-2xl font-bold"
          style={{
            backgroundImage:
              "linear-gradient(to right top, #ff914d, #ffa44b, #ffb74c, #ffcb50, #ffde59)",
          }}
        >
          Upload Receipt
        </div>

        <div className="my-6">
          {/* Upload Button Centered */}
          <div className="flex justify-center">
            <UploadButton onUpload={handleImageUpload} />
          </div>

          {/* Show the image preview if available */}
          {imageURL && (
            <div className="my-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-600">Uploaded Receipt:</h2>
              <Image
                src={imageURL}
                alt="Uploaded receipt"
                width={400}
                height={400}
                className="rounded-lg mx-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white shadow-lg transition-transform transform ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Gradient Banner for Side Panel */}
        <div
          className="p-4 text-white text-xl font-semibold"
          style={{
            backgroundImage:
              "linear-gradient(to right top, #ff914d, #ffa44b, #ffb74c, #ffcb50, #ffde59)",
          }}
        >
          Receipt Items
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-700">Processing your receipt. Please wait...</p>
          ) : (
            receiptData && (
              <ReceiptTable receiptItems={receiptData.items} onToggleSplit={toggleSplit} />
            )
          )}
        </div>
        {/* Submit Button inside the side panel */}
        {!loading && receiptData && (
          <div className="p-6">
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 text-white px-6 py-3 text-lg font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-lg"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
