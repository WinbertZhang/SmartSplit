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
    <div className="rounded-lg shadow-lg overflow-hidden bg-[#353B47]">
      <table className="min-w-full text-white">
        <thead>
          <tr className="bg-[#1A2535]">
            <th className="py-3 px-4 text-left font-medium text-white">Item</th>
            <th className="py-3 px-4 text-left font-medium text-white">Price</th>
            <th className="py-3 px-4 text-center font-medium text-white">Split?</th>
          </tr>
        </thead>
        <tbody>
          {receiptItems.map((item) => (
            <tr key={item.id} className="border-t border-gray-600 hover:bg-[#4A4F5C]">
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
    </div>
  );
}

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null); // Store image URL for display
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null); // Use ReceiptData type
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // Track if the panel is open
  const router = useRouter();

  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Create a temporary URL for the image preview
    setLoading(true);
    setPanelOpen(true); // Open the side panel when image is uploaded

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append(
      'prompt',
      'Please return a JSON block with all the items and their prices in this format: { "ItemName": "$Price" }'
    );
  
    // Send the image and prompt to the Next.js API route
    try {
      const res = await fetch('/api/gemini-parse', {
        method: 'POST',
        body: formData,
      });
  
      if (res.ok) {
        const jsonResponse = await res.json();
        
        // Assuming the response is in this format: "{\"PRODUCE 4640\": \"$3.98\"}"
        const parsedData = JSON.parse(jsonResponse.text);
        
        // Convert object to array of items
        const itemsArray: ReceiptItem[] = Object.entries(parsedData).map(
          ([itemName, itemPrice], index) => ({
            id: index + 1, // Add a unique id for each item
            item: itemName,
            price: parseFloat(itemPrice.replace(/[^\d.]/g, '')), // Clean the price
          })
        );
  
        setReceiptData({ items: itemsArray }); // Set receipt data as an array of items
      } else {
        console.error('Failed to process the receipt');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  
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
    <div className="min-h-screen bg-customBlue p-6 relative">
      {/* Upload Receipt Section */}
      <div className="max-w-2xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center">
        {/* Title */}
        <h2 className="text-white text-2xl font-bold mb-6">Upload Receipt</h2>

        <div className="my-6">
          {/* Upload Button Centered */}
          <div className="flex justify-center">
            <UploadButton onUpload={handleImageUpload} />
          </div>

          {/* Show the image preview if available */}
          {imageURL && (
            <div className="my-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Uploaded Receipt:</h2>
              <Image
                src={imageURL}
                alt="Uploaded Receipt"
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
        className={`fixed top-0 right-0 w-96 h-full bg-[#212C40] shadow-lg border-l border-gray-700 transition-transform transform ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 bg-[#1A2535] text-white text-xl font-semibold">
          Receipt Items
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-400">Processing your receipt. Please wait...</p>
          ) : (
            receiptData && (
              <ReceiptTable receiptItems={receiptData.items} onToggleSplit={toggleSplit} />
            )
          )}
        </div>
        {!loading && receiptData && (
          <div className="p-6">
            <button
              onClick={handleSubmit}
              className="w-full bg-[#353B47] text-white px-6 py-3 text-lg font-semibold rounded-lg hover:bg-[#4A4F5C] transition-all shadow-lg"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
