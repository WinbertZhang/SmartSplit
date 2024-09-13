"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Move this to the top of the component
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
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

import { ReceiptData, ReceiptItem } from "@/data/receiptTypes";
import { ReceiptProvider } from "@/context/receiptContext";

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();
  const auth = getAuth();

  // Handle image upload and processing
  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage)); // Show image preview
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      // Upload the image to Firebase Storage and get the download URL
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
        })
      );

      const receiptDataToSave: ReceiptData = {
        items: itemsArray,
        subtotal,
        tax,
        total,
        receiptUrl: downloadURL,
        userId: user.uid
      };

      setReceiptData(receiptDataToSave);
      showSuccessToast(
        "Receipt data and image URL saved to Firebase successfully!"
      );
    } catch (error) {
      console.error("Error processing receipt:", error);
      showErrorToast("Error processing receipt!");
    }

    setLoading(false);
  };

  // Handle editing an item
  const editItem = (
    id: number,
    updatedItem: Partial<{
      item: string;
      price: number;
      subtotal?: number;
      tax?: number;
      total?: number;
    }>
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

// Handle confirming and navigating to split page
const handleConfirm = async () => {
  if (receiptData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save the receipt items to Firestore and get the receipt ID
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
    <ReceiptProvider>
    <div className="items-center z-10 mt-20 pt-20">
      {/* Upload Receipt Section */}
      <div className="max-w-4xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center">
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
          <div className="text-white text-xl font-semibold">Receipt Items</div>

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
                onClick={handleConfirm} // Navigate to Split page
                className="w-full bg-[#FF6347] text-white px-6 py-3 mt-4 text-lg font-semibold rounded-lg hover:bg-[#FF7F50] transition-all shadow-lg"
              >
                Confirm and Split
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div></ReceiptProvider>
  );
}
