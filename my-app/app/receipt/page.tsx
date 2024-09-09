"use client";

import { useState } from "react";
import UploadButton from "@/components/uploadButton";
import Image from "next/image";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import ReceiptTable from "@/components/receiptTable";

// Define the structure of a receipt item
interface ReceiptItem {
  id: number;
  item: string;
  price: number;
  split: boolean; // New field to track whether the user wants to split the item
}

// Define the structure of the receipt data
interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null); // Store image URL for display
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null); // Use ReceiptData type
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const showSuccessToast = () => {
    toast.success(
      <div className="flex items-center">
        Receipt data saved successfully!
      </div>,
      {
        position: "top-center",
        autoClose: 3000, // 3 seconds
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      }
    );
  };

  const showErrorToast = () => {
    toast.error(
      <div className="flex items-center">
        Error saving receipt data!
      </div>,
      {
        position: "top-center",
        autoClose: 3000, // 3 seconds
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      }
    );
  };

  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Create a temporary URL for the image preview
    setLoading(true);

    const formData = new FormData();
    formData.append("image", uploadedImage);
    formData.append(
      "prompt",
      'Please return a JSON block with all the items and their prices in this format: { "ItemName": "$Price" }'
    );

    // Send the image and prompt to the Next.js Gemini API route
    try {
      const res = await fetch("/api/gemini-parse", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        const cleanedData = jsonResponse.cleanedJson; // Cleaned JSON data

        console.log("Cleaned Data for Receipt:", cleanedData); // Debugging statement

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
          ([itemName, itemPrice], index) => {
            const priceString = itemPrice ? String(itemPrice) : "0";
            return {
              id: index + 1, // Add a unique id for each item
              item: itemName,
              price: parseFloat(priceString.replace(/[^\d.]/g, "")) || 0, // Clean the price and handle invalid numbers
              split: false, // Default to false
            };
          }
        );

        console.log("Items Array for ReceiptTable:", itemsArray); // Debugging statement

        setReceiptData({ items: itemsArray, subtotal, tax, total }); // Set receipt data as an array of items
      } else {
        console.error("Failed to process the receipt");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  // Toggle the split status for an item
  const toggleSplit = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.map((item) =>
        item.id === id ? { ...item, split: !item.split } : item
      );
      setReceiptData({ ...receiptData, items: updatedItems });
    }
  };

  // Handle submit and save to Firebase
  const handleSubmit = async () => {
    const confirmation = window.confirm("Are you sure you want to submit?");
    if (confirmation && receiptData) {
      try {
        // Save receipt data to Firebase Firestore
        const expensesCollection = collection(db, "expenses");
        await addDoc(expensesCollection, {
          items: receiptData.items,
          subtotal: receiptData.subtotal,
          tax: receiptData.tax,
          total: receiptData.total,
          createdAt: new Date(),
        });

        console.log("Receipt data saved to Firestore");

        // Show success toast notification
        showSuccessToast();
        setIsSubmitted(true);

        setTimeout(() => {
          resetPage();
        }, 3000);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        // Show error toast notification
        showErrorToast();
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
              <h2 className="text-xl font-semibold mb-4 text-white">
                Uploaded Receipt:
              </h2>
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
        <div className="m-4">
          <div className=" text-white text-xl font-semibold">Receipt Items</div>

          <div className="p-6">
            {loading ? (
              <p className="text-gray-400">
                Processing your receipt. Please wait...
              </p>
            ) : (
              receiptData && (
                <ReceiptTable
                  receiptItems={receiptData.items}
                  subtotal={receiptData.subtotal}
                  tax={receiptData.tax}
                  total={receiptData.total}
                  onToggleSplit={toggleSplit}
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
