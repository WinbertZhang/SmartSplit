"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadButton from "@/components/uploadButton";
import Image from "next/image";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/toastNotifications";
import ReceiptTable from "@/components/receiptTable";
import { processReceiptImage } from "@/components/receiptProcessor";
import {
  uploadImageToFirebaseStorage,
  saveReceiptItemsToFirestore,
} from "@/lib/firebaseUtils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Add auth state change listener
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes";
import { FaReceipt } from "react-icons/fa";

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  // Check if the user is logged in, otherwise redirect to the login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User not logged in, redirect to login page and pass the return URL
        router.push(`/login?returnUrl=/upload-receipt`);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, router]);

  // Handle image upload and processing
  // THIS HERE HANDLES GEMINI CALL AND SAVES TO FIREBASE
  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage));
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const downloadURL = await uploadImageToFirebaseStorage(uploadedImage, user.uid);
      if (!downloadURL) {
        throw new Error("Failed to upload image");
      }

      const cleanedData = await processReceiptImage(uploadedImage);

      // Extract Subtotal, Tax, and Total
      const subtotal = cleanedData.Subtotal
        ? parseFloat(cleanedData.Subtotal.replace(/[^\d.]/g, ""))
        : 0;
      const tax = cleanedData.Tax
        ? parseFloat(cleanedData.Tax.replace(/[^\d.]/g, ""))
        : 0;
      const total = cleanedData.Total
        ? parseFloat(cleanedData.Total.replace(/[^\d.]/g, ""))
        : 0;

      const createdAt = new Date();

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
          splitters: [],
        })
      );

      const receiptDataToSave: ReceiptData = {
        items: itemsArray,
        subtotal,
        tax,
        total,
        receiptUrl: downloadURL,
        userId: user.uid,
        createdAt,
        splitDetails: [],
      };

      setReceiptData(receiptDataToSave);
      showSuccessToast("Receipt data and image URL saved to Firebase successfully!");
    } catch (error) {
      console.error("Error processing receipt:", error);
      showErrorToast("Error processing receipt!");
    }

    setLoading(false);
  };

  const recalculateTotals = (items: ReceiptItem[], tax: number) => {
    const subtotal = items.reduce((acc, item) => acc + item.price, 0);
    const total = subtotal + tax;
    return { subtotal, total };
  };

  const editItem = (
    id: number,
    updatedItem: Partial<{ item: string; price: number; subtotal?: number; tax?: number; total?: number; }>
  ) => {
    if (receiptData) {
      if (id === 0) {
        const { subtotal, total } = recalculateTotals(receiptData.items, updatedItem.tax || receiptData.tax);
        setReceiptData({ ...receiptData, ...updatedItem, subtotal, total });
      } else {
        const updatedItems = receiptData.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        );
        const { subtotal, total } = recalculateTotals(updatedItems, receiptData.tax);
        setReceiptData({ ...receiptData, items: updatedItems, subtotal, total });
      }
    }
  };

  const removeItem = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.filter((item) => item.id !== id);
      const { subtotal, total } = recalculateTotals(updatedItems, receiptData.tax);
      setReceiptData({ ...receiptData, items: updatedItems, subtotal, total });
    }
  };

  const addNewItem = (newItem: ReceiptItem) => {
    if (receiptData) {
      const updatedItems = [...receiptData.items, newItem];
      const { subtotal, total } = recalculateTotals(updatedItems, receiptData.tax);
      setReceiptData({ ...receiptData, items: updatedItems, subtotal, total });
    }
  };

const handleConfirm = async () => {
  if (receiptData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const receiptId = await saveReceiptItemsToFirestore(user.uid, receiptData);
      setImageURL(imageURL);

      // Navigate to the split page and pass the image URL via query string
      router.push(`/receipt/${receiptId}`);
    } catch (error) {
      console.error("Error saving receipt:", error);
      showErrorToast("Error saving receipt data!");
    }
  }
};

  return (
    <div className="items-center z-10 mt-20 pt-20">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">Upload Receipt</h2>
        <p className="text-gray-400 mb-6">Upload your receipt to split expenses easily.</p>
      </div>
      <div className="max-w-4xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center">

        <div className="my-6">
          <div className="flex justify-center">
            <button
              className="bg-[#212C40] text-white p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-gray-400"
              onClick={() => document.getElementById('file-input')?.click()} // Trigger the file input dialog
            >
              <FaReceipt className="text-gray-400 hover:text-white text-6xl mb-4 transition-colors duration-200" />
              <span className="text-lg font-semibold">Upload Receipt</span>
            </button>
            <input
              id="file-input"
              type="file"
              accept="image/"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>
        <div className="my-6">
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
                  onEditItem={editItem}
                  onRemoveItem={removeItem}
                  onAddNewItem={addNewItem}
                />
              )
            )}
          </div>

          {!loading && receiptData && (
            <div className="p-6">
              <button
                onClick={handleConfirm}
                className="w-full bg-[#FF6347] text-white px-6 py-3 mt-4 text-lg font-semibold rounded-lg hover:bg-[#FF7F50] transition-all shadow-lg"
              >
                Confirm and Split
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
