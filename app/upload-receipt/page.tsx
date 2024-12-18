"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation within Next.js
import Image from "next/image"; // Optimized image component from Next.js
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/toastNotifications"; // Utility for showing toast notifications
import ReceiptTable from "@/components/receiptTable"; // Component for displaying receipt items in a table
import {
  uploadImageToFirebaseStorage,
  saveReceiptItemsToFirestore,
} from "@/lib/firebaseUtils"; // Utility functions for uploading images and saving data to Firestore
import { ToastContainer } from "react-toastify"; // Toast container for showing notifications
import "react-toastify/dist/ReactToastify.css"; // Importing Toastify CSS
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth for managing authentication state
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes"; // Types for receipt data and items
import { FaReceipt } from "react-icons/fa"; // Icon for receipt upload button

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null); // State for the image URL
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null); // State for storing receipt data
  const [loading, setLoading] = useState(false); // Loading state for when the receipt is being processed
  const [manualEntryMode, setManualEntryMode] = useState(false); // Toggle for manual entry mode
  const router = useRouter(); // Router for navigating between pages
  const auth = getAuth(); // Get Firebase Auth instance

  // Check if the user is logged in, otherwise redirect to the login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not logged in, redirect to the login page and pass the return URL
        router.push(`/login?returnUrl=/upload-receipt`);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [auth, router]);

  // Handle the image upload and receipt processing
  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Set local URL for previewing the image
    setLoading(true); // Set loading state to true

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Upload the image to Firebase Storage
      const downloadURL = await uploadImageToFirebaseStorage(
        uploadedImage,
        user.uid
      );
      if (!downloadURL) {
        throw new Error("Failed to upload image");
      }

      if (manualEntryMode) {
        setReceiptData((prevData) => ({
          ...prevData,
          receiptUrl: downloadURL,
          userId: prevData?.userId || auth.currentUser?.uid || "",
          items: prevData?.items || [],
          subtotal: prevData?.subtotal || 0,
          tax: prevData?.tax || 0,
          tip: prevData?.tip || 0,
          total: prevData?.total || 0,
          createdAt: prevData?.createdAt || new Date(),
          splitDetails: prevData?.splitDetails || [],
        }));
        showSuccessToast("Image uploaded successfully!");
      } else {
        // Process the uploaded receipt image using Gemini API
        const cleanedData = await processReceiptImage(uploadedImage);

        // Extract Subtotal, Tax, and Total from the cleaned data
        const subtotal = 0;
        const tax = 0;
        const tip = 0;
        const total = 0;

        const createdAt = new Date(); // Set the current date and time

        // Filter out non-item keys like "Subtotal", "Tax", and "Total" from the cleaned data
        const filteredData = Object.entries(cleanedData).filter(
          ([key]) => !["Subtotal", "Tax", "Total"].includes(key)
        );

        // Convert the cleaned data into an array of receipt items
        const itemsArray: ReceiptItem[] = filteredData.map(
          ([itemName, itemPrice], index) => ({
            id: index + 1,
            item: itemName,
            price:
              parseFloat((itemPrice as string).replace(/[^\d.]/g, "")) || 0,
            splitters: [],
          })
        );

        // Create the receipt data object to save to Firestore
        const receiptDataToSave: ReceiptData = {
          items: itemsArray,
          subtotal,
          tax,
          tip,
          total,
          receiptUrl: downloadURL,
          userId: user.uid,
          createdAt,
          splitDetails: [],
        };

        setReceiptData(receiptDataToSave); // Set the receipt data in state
        showSuccessToast("Receipt data processed successfully!"); // Show success toast
      }
    } catch (error) {
      showErrorToast("Error processing receipt! Please try again later.");
    }

    setLoading(false); // Set loading state to false after processing is complete
  };

  // Process the receipt image using the backend Gemini API for parsing
  const processReceiptImage = async (uploadedImage: File) => {
    const formData = new FormData();
    formData.append("image", uploadedImage); // Append the image file to form data
    formData.append(
      "prompt",
      'Please return a JSON block with all the items and their prices in this format: { "ItemName": "$Price" }'
    );

    const res = await fetch("/api/gemini-parse", {
      method: "POST",
      body: formData, // Send the form data to the backend API
    });

    if (!res.ok) {
      throw new Error("Failed to process receipt");
    }

    const jsonResponse = await res.json(); // Parse the JSON response
    return jsonResponse.cleanedJson; // Return the cleaned JSON data
  };

  const toggleManualEntryMode = () => {
    setManualEntryMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        setReceiptData({
          items: [],
          subtotal: 0,
          tax: 0,
          tip: 0,
          total: 0,
          receiptUrl: "",
          userId: auth.currentUser?.uid || "",
          createdAt: new Date(),
          splitDetails: [],
        });
      }
      return newMode;
    });
  };

  // Recalculate the subtotal and total based on the items and tax
  const recalculateTotals = (
    items: ReceiptItem[],
    tax: number,
    tip: number
  ) => {
    const subtotal = items.reduce((acc, item) => acc + item.price, 0); // Calculate subtotal
    const total = subtotal + tax + tip; // Calculate total by adding tax
    return { subtotal, total };
  };

  // Edit an item in the receipt
  const editItem = (
    id: number,
    updatedItem: Partial<{
      item: string;
      price: number;
      subtotal?: number;
      tax?: number;
      tip?: number;
      total?: number;
    }>
  ) => {
    if (receiptData) {
      if (id === 0) {
        const { subtotal, total } = recalculateTotals(
          receiptData.items,
          updatedItem.tax || receiptData.tax,
          updatedItem.tip || receiptData.tip
        );
        setReceiptData({ ...receiptData, ...updatedItem, subtotal, total }); // Update the receipt data
      } else {
        const updatedItems = receiptData.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        );
        const { subtotal, total } = recalculateTotals(
          updatedItems,
          receiptData.tax,
          receiptData.tip
        );
        setReceiptData({
          ...receiptData,
          items: updatedItems,
          subtotal,
          total,
        });
      }
    }
  };

  // Remove an item from the receipt
  const removeItem = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.filter((item) => item.id !== id); // Filter out the removed item
      const { subtotal, total } = recalculateTotals(
        updatedItems,
        receiptData.tax,
        receiptData.tip
      );
      setReceiptData({ ...receiptData, items: updatedItems, subtotal, total }); // Update the receipt data
    }
  };

  // Add a new item to the receipt
  const addNewItem = (newItem: ReceiptItem) => {
    if (receiptData) {
      const updatedItems = [...receiptData.items, newItem]; // Add the new item to the list
      const { subtotal, total } = recalculateTotals(
        updatedItems,
        receiptData.tax,
        receiptData.tip
      );
      setReceiptData({ ...receiptData, items: updatedItems, subtotal, total }); // Update the receipt data
    }
  };

  // Handle confirmation and save the receipt data to Firestore
  const handleConfirm = async () => {
    if (receiptData) {
      try {
        const { subtotal, total } = recalculateTotals(
          receiptData.items,
          receiptData.tax || 0,
          receiptData.tip || 0
        );
        const updatedReceiptData = { ...receiptData, subtotal, total }; // Update the receipt data

        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Save receipt items to Firestore
        const receiptId = await saveReceiptItemsToFirestore(
          user.uid,
          updatedReceiptData
        );
        setImageURL(imageURL); // Set the image URL
        router.push(`/receipt/${receiptId}`); // Navigate to the receipt details page
      } catch (error) {
        console.error("Error saving receipt:", error);
        showErrorToast("Error saving receipt data!"); // Show error toast on failure
      }
    }
  };

  return (
    <div className="items-center z-10 mt-20 pt-20">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
          Upload Receipt
        </h2>
        <p className="text-md text-gray-400 px-4 py-2 max-w-lg mx-auto">
          <span className="text-gray-300 font-bold">Automatic Mode: </span>
          Upload your receipt, and the app will automatically extract all items
          and prices. After a short loading time, you can easily edit and
          confirm the data.
          <br />
          <br />
          <span className="text-gray-300 font-bold">Manual Mode: </span>
          Switch to manual entry to input the items yourself without uploading a
          receipt image.
        </p>
      </div>
      <div className="max-w-2xl sm:max-w-4xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center">
        {!loading && !receiptData && !manualEntryMode && (
          <div className="my-6">
            {/* Image upload button */}
            <div className="flex justify-center">
              <button
                className="bg-[#212C40] text-white p-6 sm:p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-gray-400"
                onClick={() => document.getElementById("file-input")?.click()} // Trigger the file input dialog
              >
                <FaReceipt className="text-gray-400 hover:text-white text-4xl sm:text-6xl mb-4 transition-colors duration-200" />
                <span className="text-md sm:text-lg font-semibold">
                  {manualEntryMode
                    ? "Optional Receipt Image Upload"
                    : "Upload Receipt"}
                </span>
              </button>
              <input
                id="file-input"
                type="file"
                accept="image/"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files[0])
                } // Handle file upload
                className="hidden"
              />
            </div>
          </div>
        )}

        {!imageURL && !manualEntryMode && (
          <div className="flex justify-center mb-6">
            <button
              className={`p-3 rounded-md text-white ${
                manualEntryMode ? "bg-green-500" : "bg-blue-500"
              }`}
              onClick={toggleManualEntryMode}
            >
              {manualEntryMode
                ? "Switch to Automatic Upload"
                : "Switch to Manual Entry"}
            </button>
          </div>
        )}

        {manualEntryMode && !imageURL && (
          <div className="my-6">
            {/* Optional image upload button in manual mode */}
            <div className="flex justify-center">
              <button
                className="bg-[#212C40] text-white p-6 sm:p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-gray-400"
                onClick={() => document.getElementById("file-input")?.click()} // Trigger the file input dialog
              >
                <FaReceipt className="text-gray-400 hover:text-white text-4xl sm:text-6xl mb-4 transition-colors duration-200" />
                <span className="text-md sm:text-lg font-semibold">
                  Optional Receipt Image Upload
                </span>
              </button>
              <input
                id="file-input"
                type="file"
                accept="image/"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files[0])
                } // Handle file upload
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Display uploaded image */}
        <div className="my-6">
          {imageURL && (
            <div className="my-6">
              <Image
                src={imageURL}
                alt="Uploaded Receipt"
                width={400}
                height={400}
                className="rounded-lg mx-auto"
              />
            </div>
          )}

          {/* Instructions for editing receipt items */}
          {receiptData && (
            <p className="text-md text-gray-400 px-4 py-2 max-w-lg mx-auto">
              <span className="text-gray-300 font-bold text-lg"> Tip: </span>{" "}
              <br></br>To edit names and prices, simply{" "}
              <span className="text-gray-300 font-bold">click</span> on the
              field you would like to edit and begin typing. For prices, make
              sure to press on the
              <span className="text-gray-300 font-bold"> right side </span> of
              the field to enter the correct value.
            </p>
          )}
        </div>

        {/* Show receipt table or loading message */}
        <div className="">
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
                tip={receiptData.tip}
                total={receiptData.total}
                onEditItem={editItem}
                onRemoveItem={removeItem}
                onAddNewItem={addNewItem}
              />
            )
          )}
        </div>

        {/* Confirm and Split button */}
        {!loading && receiptData && (
          <div className="p-6">
            <button
              onClick={handleConfirm}
              className="w-full bg-[#FF6347] text-white px-6 py-3 mt-4 text-md sm:text-lg font-semibold rounded-lg hover:bg-[#FF7F50] transition-all shadow-lg"
            >
              Confirm and Split
            </button>
          </div>
        )}
      </div>

      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
}
