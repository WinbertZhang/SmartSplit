"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/toastNotifications";
import ReceiptTable from "@/components/receiptTable";
import {
  uploadImageToFirebaseStorage,
  saveReceiptItemsToFirestore,
} from "@/lib/firebaseUtils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes";
import { FaReceipt } from "react-icons/fa";

export default function ReceiptPage() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [user, setUser] = useState<any>(null); // <-- New local state to hold the user or null
  const router = useRouter();
  const auth = getAuth();

  // Allow optional sign-in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null); 
        // We do NOT redirect if user is not logged in – now optional
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage));
    setLoading(true);

    try {
      // If logged in, upload the image to Firebase storage
      let downloadURL = "";
      if (user && user.uid) {
        downloadURL = await uploadImageToFirebaseStorage(uploadedImage, user.uid);
      } else {
        // Handle the guest mode (when user is null)
        downloadURL = imageURL || "";
      }

      if (manualEntryMode) {
        setReceiptData((prevData) => ({
          ...prevData,
          receiptUrl: downloadURL,
          userId: user?.uid || "", // If not logged in, store empty
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
        // Automatic receipt processing via Gemini
        const cleanedData = await processReceiptImage(uploadedImage);

        // For demonstration, set these to 0 or parse them from cleanedData if needed
        const subtotal = 0;
        const tax = 0;
        const tip = 0;
        const total = 0;
        const createdAt = new Date();

        // Filter out known keys
        const filteredData = Object.entries(cleanedData).filter(
          ([key]) => !["Subtotal", "Tax", "Total"].includes(key)
        );

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
          tip,
          total,
          receiptUrl: downloadURL,
          userId: user?.uid || "", // If not logged in, store empty
          createdAt,
          splitDetails: [],
        };
        setReceiptData(receiptDataToSave);
        showSuccessToast("Receipt data processed successfully!");
      }
    } catch (error) {
      showErrorToast("Error processing receipt! Please try again later.");
      console.error(error);
    }
    setLoading(false);
  };

  // Process the receipt image using the backend Gemini API
  const processReceiptImage = async (uploadedImage: File) => {
    const formData = new FormData();
    formData.append("image", uploadedImage);

    const res = await fetch("/api/gemini-parse", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to process receipt");
    }

    const jsonResponse = await res.json();
    return jsonResponse.cleanedJson;
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
          userId: user?.uid || "",
          createdAt: new Date(),
          splitDetails: [],
        });
      }
      return newMode;
    });
  };

  // Recalculate the subtotal and total based on the items, tax, and tip
  const recalculateTotals = (
    items: ReceiptItem[],
    tax: number,
    tip: number
  ) => {
    const subtotal = items.reduce((acc, item) => acc + item.price, 0);
    const total = subtotal + tax + tip;
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
        // Editing tax or tip
        const { subtotal, total } = recalculateTotals(
          receiptData.items,
          updatedItem.tax ?? receiptData.tax,
          updatedItem.tip ?? receiptData.tip
        );
        setReceiptData({ ...receiptData, ...updatedItem, subtotal, total });
      } else {
        // Editing a line item
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

  // Remove an item
  const removeItem = (id: number) => {
    if (receiptData) {
      const updatedItems = receiptData.items.filter((item) => item.id !== id);
      const { subtotal, total } = recalculateTotals(
        updatedItems,
        receiptData.tax,
        receiptData.tip
      );
      setReceiptData({ ...receiptData, items: updatedItems, subtotal, total });
    }
  };

  // Add a new item
  const addNewItem = (newItem: ReceiptItem) => {
    if (receiptData) {
      const updatedItems = [...receiptData.items, newItem];
      const { subtotal, total } = recalculateTotals(
        updatedItems,
        receiptData.tax,
        receiptData.tip
      );
      setReceiptData({ ...receiptData, items: updatedItems, subtotal, total });
    }
  };

  // Confirm and Split
  const handleConfirm = async () => {
    if (!receiptData) return;

    const { subtotal, total } = recalculateTotals(
      receiptData.items,
      receiptData.tax || 0,
      receiptData.tip || 0
    );
    const updatedReceiptData = { ...receiptData, subtotal, total };

    // If the user is logged in, save to Firestore
    if (user) {
      try {
        const receiptId = await saveReceiptItemsToFirestore(
          user.uid,
          updatedReceiptData
        );
        setImageURL(imageURL);
        router.push(`/receipt/${receiptId}`);
      } catch (error) {
        console.error("Error saving receipt:", error);
        showErrorToast("Error saving receipt data!");
      }
    } else {
      // If not logged in, skip Firestore. Just let them see the splits in a “guest” route.
      // For example, we can push them to a “guest” summary page or store ephemeral data in localStorage:
      localStorage.setItem("guestReceiptData", JSON.stringify(updatedReceiptData));
      showSuccessToast("Receipt data stored locally. Proceeding to splits...");
      // Push to a “guest” or ephemeral route:
      router.push("/receipt/guest"); 
      // Alternatively, you could show a local summary with no navigation.
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
          <br />
          <br />
          <span className="text-sm text-gray-500">
            {user
              ? "You are logged in. Your data will be saved to Firestore."
              : "You are in guest mode. Your data will only be saved locally."}
          </span>
        </p>
      </div>
      <div className="max-w-2xl sm:max-w-4xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center">
        {!loading && !receiptData && !manualEntryMode && (
          <div className="my-6">
            <div className="flex justify-center">
              <button
                className="bg-[#212C40] text-white p-6 sm:p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-gray-400"
                onClick={() => document.getElementById("file-input")?.click()}
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
                }
                className="hidden"
              />
            </div>
          </div>
        )}

        {!imageURL && (
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
            <div className="flex justify-center">
              <button
                className="bg-[#212C40] text-white p-6 sm:p-6 rounded-xl shadow-xl text-center hover:bg-[#1A2535] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-gray-400"
                onClick={() => document.getElementById("file-input")?.click()}
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
                }
                className="hidden"
              />
            </div>
          </div>
        )}

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

        {receiptData && (
          <p className="text-md text-gray-400 px-4 py-2 max-w-lg mx-auto">
            <span className="text-gray-300 font-bold text-lg"> Tip: </span>{" "}
            <br />
            To edit names and prices, simply{" "}
            <span className="text-gray-300 font-bold">click</span> on the field
            you would like to edit and begin typing. For prices, make sure to
            press on the <span className="text-gray-300 font-bold">right side</span> 
            of the field to enter the correct value.
          </p>
        )}

        <div>
          {loading ? (
            <p className="text-gray-400">Processing your receipt. Please wait...</p>
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
      <ToastContainer />
    </div>
  );
}