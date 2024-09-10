"use client";

import { useState } from "react";
import UploadButton from "@/components/uploadButton";
import Image from "next/image";
import { showSuccessToast, showErrorToast } from "@/components/toastNotifications";
import ReceiptTable from "@/components/receiptTable";
import { processReceiptImage } from "@/components/receiptProcessor";
import { saveReceiptToFirebase } from "@/lib/firestoreUtils";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

// Define the structure of a receipt item
interface ReceiptItem {
  id: number;
  item: string;
  price: number;
  split: boolean;
}

// Define the structure of the receipt data
interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle image upload and processing
  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Show image preview
    setLoading(true);

    try {
      const cleanedData = await processReceiptImage(uploadedImage);

      // Extract Subtotal, Tax, and Total
      const subtotal = cleanedData.Subtotal ? parseFloat(cleanedData.Subtotal.replace(/[^\d.]/g, "")) : 0;
      const tax = cleanedData.Tax ? parseFloat(cleanedData.Tax.replace(/[^\d.]/g, "")) : 0;
      const total = cleanedData.Total ? parseFloat(cleanedData.Total.replace(/[^\d.]/g, "")) : 0;

      // Filter out non-item keys like "Subtotal", "Tax", and "Total"
      const filteredData = Object.entries(cleanedData).filter(
        ([key]) => !["Subtotal", "Tax", "Total"].includes(key)
      );

      // Convert object to array of items
      const itemsArray: ReceiptItem[] = filteredData.map(
        ([itemName, itemPrice], index) => ({
          id: index + 1,
          item: itemName,
          price: parseFloat((itemPrice as string).replace(/[^\d.]/g, "")) || 0,
          split: false,
        })
      );

      setReceiptData({ items: itemsArray, subtotal, tax, total });
    } catch (error) {
      console.error("Error processing receipt:", error);
      showErrorToast("Error processing receipt!");
    }

    setLoading(false);
  };

  // Handle toggling the split status of an item
  const toggleSplit = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.map((item) =>
        item.id === id ? { ...item, split: !item.split } : item
      );
      setReceiptData({ ...receiptData, items: updatedItems });
    }
  };

  // Handle editing an item
  const editItem = (
    id: number,
    updatedItem: Partial<{ item: string; price: number; subtotal?: number; tax?: number; total?: number }>
  ) => {
    if (receiptData) {
      if (id === 0) {
        // Update subtotal, tax, or total
        setReceiptData({ ...receiptData, ...updatedItem });
      } else {
        const updatedItems = receiptData.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        );
        setReceiptData({ ...receiptData, items: updatedItems });
      }
    }
  };

  // Handle removing an item
  const removeItem = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.filter((item) => item.id !== id);
      setReceiptData({ ...receiptData, items: updatedItems });
    }
  };

  // Handle reordering items
  const reorderItems = (items: ReceiptItem[]) => {
    setReceiptData((prevState) => (prevState ? { ...prevState, items } : null));
  };

  // Handle adding a new item
  const addNewItem = (newItem: ReceiptItem) => {
    if (receiptData) {
      const updatedItems = [...receiptData.items, newItem];
      setReceiptData({ ...receiptData, items: updatedItems });
    }
  };

  // Handle submitting the receipt data to Firebase
  const handleSubmit = async () => {
    const confirmation = window.confirm("Are you sure you want to submit?");
    if (confirmation && receiptData) {
      try {
        await saveReceiptToFirebase(receiptData);
        showSuccessToast("Receipt data saved successfully!");
        setIsSubmitted(true);

        setTimeout(() => {
          resetPage();
        }, 3000);
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        showErrorToast("Error saving receipt data!");
      }
    }
  };

  const resetPage = () => {
    setImageURL(null);
    setReceiptData(null);
    setIsSubmitted(false);
  };

  return (
    <div className="items-center z-10 mt-20 pt-20">
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
              <Image src={imageURL} alt="Uploaded Receipt" width={400} height={400} className="rounded-lg mx-auto" />
            </div>
          )}
        </div>
        
        <div className="m-4">
          <div className="text-white text-xl font-semibold">Receipt Items</div>

          <div className="p-6">
            {loading ? (
              <p className="text-gray-400">Processing your receipt. Please wait...</p>
            ) : (
              receiptData && (
                <ReceiptTable
                  receiptItems={receiptData.items}
                  subtotal={receiptData.subtotal}
                  tax={receiptData.tax}
                  total={receiptData.total}
                  onToggleSplit={toggleSplit}
                  onEditItem={editItem}
                  onRemoveItem={removeItem}
                  onReorderItems={reorderItems}
                  onAddNewItem={addNewItem}
                />
              )
            )}
          </div>

          {!loading && receiptData && (
            <div className="p-6">
              <button
                onClick={handleSubmit}
                className="w-full bg-[#353B47] text-white px-6 py-3 text-lg font-semibold rounded-lg hover:bg-[#4A4F5C] transition-all shadow-lg"
                disabled={isSubmitted}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
