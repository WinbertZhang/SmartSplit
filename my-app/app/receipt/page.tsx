"use client";

import { useState } from "react";
import UploadButton from "@/components/uploadButton";
import ReceiptTable from "@/components/receiptTable";
import Image from "next/image";

// Define the structure of a receipt item with `id`
interface ReceiptItem {
  id: number;
  item: string;
  price: number; // Price is now a number after processing
}

// Define the structure of the receipt data that will be returned from the API
interface ReceiptData {
  items: ReceiptItem[];
}

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null); // Store image URL for display
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null); // Use ReceiptData type
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Create a temporary URL for the image preview
    setLoading(true);

    // Mock data to simulate receipt items instead of calling Gemini API
    const mockReceiptData: ReceiptData = {
      items: [
        { id: 1, item: "Bounty Paper Towels", price: 2.99 },
        { id: 2, item: "Organic Bananas", price: 1.5 },
        { id: 3, item: "Milk", price: 3.49 },
        { id: 4, item: "Bread", price: 2.29 },
      ],
    };

    // Simulate a delay to mock API call processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Instead of calling the API, set the fake receipt data
    setReceiptData(mockReceiptData);

    // Commenting out the actual API request part
    /*
    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append(
      'prompt',
      'Please return a JSON block with all the items and their prices in this format: { "ItemName": "$Price" }'
    );

    try {
      const res = await fetch('/api/gemini-parse', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        const parsedData = JSON.parse(jsonResponse.text);

        const itemsArray: ReceiptItem[] = Object.entries(parsedData).map(
          ([itemName, itemPrice], index) => ({
            id: index + 1,
            item: itemName,
            price: parseFloat(itemPrice.replace(/[^\d.]/g, '')),
          })
        );

        setReceiptData({ items: itemsArray });
      } else {
        console.error('Failed to process the receipt');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    */

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Upload Receipt</h1>
        <UploadButton onUpload={handleImageUpload} />

        {/* Show the image preview if available */}
        {imageURL && (
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-4">Uploaded Receipt:</h2>
            <Image
              src={imageURL}
              alt="Uploaded receipt"
              width={400}
              height={400}
            />
          </div>
        )}

        {loading && <p>Processing your receipt...</p>}

        {receiptData && <ReceiptTable receiptItems={receiptData.items} />}
      </div>
    </div>
  );
}
