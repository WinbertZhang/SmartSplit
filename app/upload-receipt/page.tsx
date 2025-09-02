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
  const [isDragOver, setIsDragOver] = useState(false);
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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const handleImageUpload = async (uploadedImage: File) => {
    setImageURL(URL.createObjectURL(uploadedImage));
    setLoading(true);

    try {
      let downloadURL = "";

      if (user && user.uid) {
        downloadURL = await uploadImageToFirebaseStorage(
          uploadedImage,
          user.uid
        );
      } else {
        downloadURL = imageURL || "";
      }

      const itemsArray = await processReceiptImage(uploadedImage);

      const { subtotal, total } = recalculateTotals(itemsArray, 0, 0);

      const receiptDataToSave: ReceiptData = {
        items: itemsArray,
        subtotal,
        tax: 0,
        tip: 0,
        total,
        receiptUrl: downloadURL,
        userId: user?.uid || "",
        createdAt: new Date(),
        splitDetails: [],
      };

      setReceiptData(receiptDataToSave);
      showSuccessToast("Receipt data processed successfully!");
    } catch (error) {
      showErrorToast("Error processing receipt! Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    const cleanedJson = jsonResponse.cleanedJson;
  
    let itemsArray: ReceiptItem[] = [];
  
    if (Array.isArray(cleanedJson)) {
      // cleanedJson is already an array; map it directly.
      itemsArray = cleanedJson
        .map((item: any, index: number) => {
          if (typeof item === "object" && item !== null) {
            const keys = Object.keys(item);
            if (keys.length > 0) {
              const itemName = keys[0];
              const itemPrice = item[itemName];
              const price =
                typeof itemPrice === "string"
                  ? parseFloat(itemPrice.replace(/[^\d.-]/g, ""))
                  : Number(itemPrice);
              return {
                id: index + 1,
                item: itemName,
                price: price || 0,
                splitters: [],
              };
            }
          }
          return null;
        })
        .filter((el) => el !== null);
    } else if (typeof cleanedJson === "object" && cleanedJson !== null) {
      // cleanedJson is an object; convert it into an array.
      itemsArray = Object.entries(cleanedJson).map(([itemName, itemPrice], index) => {
        const price =
          typeof itemPrice === "string"
            ? parseFloat(itemPrice.replace(/[^\d.-]/g, ""))
            : Number(itemPrice);
        return {
          id: index + 1,
          item: itemName,
          price: price || 0,
          splitters: [],
        };
      });
    } else {
      throw new Error("Invalid cleaned JSON format");
    }
  
    return itemsArray;
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
      localStorage.setItem(
        "guestReceiptData",
        JSON.stringify(updatedReceiptData)
      );
      showSuccessToast("Receipt data stored locally. Proceeding to splits...");
      // Push to a “guest” or ephemeral route:
      router.push("/receipt/guest");
      // Alternatively, you could show a local summary with no navigation.
    }
  };

  return (
    <div className="items-center z-10 pt-24 min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
      <div className="max-w-2xl sm:max-w-4xl mx-auto bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white/20">
        {!loading && !receiptData && !manualEntryMode && (
          <div className="my-6">
            <div 
              className="flex justify-center"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <button
                className={`group relative backdrop-blur-lg text-white p-8 sm:p-10 rounded-2xl shadow-2xl text-center transition-all duration-300 flex flex-col items-center justify-center border-2 border-dashed min-w-[280px] ${
                  isDragOver 
                    ? 'bg-purple-500/30 border-purple-400 scale-105' 
                    : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-purple-400/50'
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                  isDragOver 
                    ? 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 opacity-100'
                    : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100'
                }`}></div>
                <FaReceipt className={`relative z-10 text-4xl sm:text-6xl mb-4 transition-all duration-300 ${
                  isDragOver 
                    ? 'text-white scale-125' 
                    : 'text-white/70 group-hover:text-white group-hover:scale-110'
                }`} />
                <span className="relative z-10 text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {isDragOver ? 'Drop your receipt here!' : 'Upload Receipt'}
                </span>
                <span className="relative z-10 text-sm text-white/60 mt-2">
                  {isDragOver ? 'Release to upload' : 'Click or drag to upload'}
                </span>
              </button>
              <input
                id="file-input"
                type="file"
                accept="image/*"
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
              className={`group relative px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 border ${
                manualEntryMode 
                  ? "bg-green-500/20 border-green-400/50 hover:bg-green-500/30 hover:border-green-400" 
                  : "bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/30 hover:border-blue-400"
              }`}
              onClick={toggleManualEntryMode}
            >
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                manualEntryMode 
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20" 
                  : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
              }`}></div>
              <span className="relative z-10">
                {manualEntryMode
                  ? "Switch to Automatic Upload"
                  : "Switch to Manual Entry"}
              </span>
            </button>
          </div>
        )}

        {manualEntryMode && !imageURL && (
          <div className="my-6">
            <div className="flex justify-center">
              <button
                className="group relative bg-white/10 backdrop-blur-lg text-white p-8 sm:p-10 rounded-2xl shadow-2xl text-center hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center border-2 border-dashed border-white/30 hover:border-blue-400/50 min-w-[280px]"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FaReceipt className="relative z-10 text-white/70 group-hover:text-white text-4xl sm:text-6xl mb-4 transition-all duration-300 group-hover:scale-110" />
                <span className="relative z-10 text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Optional Receipt Upload
                </span>
                <span className="relative z-10 text-sm text-white/60 mt-2">
                  Add image for reference
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
          <div className="my-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-md mx-auto">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">Uploaded Receipt</h3>
              <Image
                src={imageURL}
                alt="Uploaded Receipt"
                width={400}
                height={400}
                className="rounded-xl mx-auto shadow-lg border border-white/20"
              />
            </div>
          </div>
        )}

        {receiptData && (
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-400/20 max-w-lg mx-auto mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500/20 rounded-full p-2 mt-1">
                <span className="text-blue-400 text-lg">💡</span>
              </div>
              <div>
                <h4 className="text-blue-400 font-semibold mb-2">Editing Tip</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  To edit names and prices, simply <span className="text-white font-medium">click</span> on any field and start typing. 
                  For prices, click on the <span className="text-white font-medium">right side</span> of the field to edit the value correctly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
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
