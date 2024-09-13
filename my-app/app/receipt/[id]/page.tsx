"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useParams } from "next/navigation"; // To get the `id` from the URL and handle navigation
import { doc, getDoc } from "firebase/firestore"; // For Firestore interaction
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { db } from "@/lib/firebaseConfig"; // Your Firebase configuration
import SplitTable from "@/components/splitTable";
import FinalizeSummary from "@/components/finalizeSummary";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes";
import { useReceipt, ReceiptProvider } from "@/context/receiptContext";

function SplitPageContent() {
  const { id } = useParams(); // Get the receipt ID from the URL
  const { imageUrl } = useReceipt(); // Get the image URL from the context
  const receiptId = Array.isArray(id) ? id[0] : id; // Ensure `id` is a string
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({});
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [finalizeDisabled, setFinalizeDisabled] = useState<boolean>(false); // Control for disabling Finalize button
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Handle errors
  const auth = getAuth();

  const fetchReceiptData = useCallback(async (userId: string, userName: string) => {
    try {
      const receiptRef = doc(db, "expenses", receiptId); // Fetch the receipt based on the ID from params
      const receiptSnap = await getDoc(receiptRef);

      if (receiptSnap.exists()) {
        const data = receiptSnap.data() as ReceiptData;

        // Check if the logged-in user is the owner of the receipt
        if (data.userId !== userId) {
          toast.error("You are not authorized to view this receipt.");
          setError("You are not authorized to view this receipt.");
        } else {
          setReceiptItems(data.items);
          setReceiptUrl(data.receiptUrl || null); // Fallback to Firebase URL
          setSubtotal(data.subtotal || 0);
          setTax(data.tax || 0);
          setTotal(data.total || 0);

          setGroupMembers([userName]);
          const allItemsSet = new Set(data.items.map((item) => item.id));
          setSplitData({ [userName]: allItemsSet });
          setFinalizeDisabled(false);
        }
      } else {
        toast.error("No such document exists.");
        setError("No such document exists.");
      }
    } catch (error) {
      toast.error("Error fetching receipt data.");
      setError("Error fetching receipt data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Check if the user is logged in and load data
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userName = user.displayName?.split(" ")[0] || user.uid;

        if (imageUrl) {
          // If image URL is available in context, use it directly
          setReceiptUrl(imageUrl);
          setGroupMembers([userName]);
          setFinalizeDisabled(false); // Enable Finalize button
          setLoading(false); // Stop loading
        } else {
          // Fallback to Firebase if no imageUrl is provided in context
          fetchReceiptData(user.uid, userName);
        }
      } else {
        toast.error("You need to be logged in to view this page.");
        setError("You need to be logged in to view this page.");
      }
    });

    return () => unsubscribe(); // Cleanup the auth listener on unmount
  }, [auth, imageUrl, fetchReceiptData]);

  // Mark changes and enable Finalize button
  const handleAnyChange = () => {
    setFinalizeDisabled(false); // Enable the button when any change happens
    setShowSummary(false); // Hide the summary until finalized again
  };

  // Toggle the split status for an item and group member
  const handleToggleSplit = (itemId: number, memberName: string) => {
    setSplitData((prevData) => {
      const updatedData = { ...prevData };

      // Create a new Set for this member to ensure immutability
      const memberSet = new Set(updatedData[memberName] || []);

      if (memberSet.has(itemId)) {
        memberSet.delete(itemId); // Uncheck (remove) item from the set
      } else {
        memberSet.add(itemId); // Check (add) item to the set
      }

      updatedData[memberName] = memberSet; // Update the member's set

      handleAnyChange(); // Mark change and enable Finalize

      return updatedData; // Return new state
    });
  };

  // Add a new group member
  const handleAddMember = (newMember: string) => {
    if (groupMembers.length >= 10) {
      toast.error("You can't add more than 10 members!");
      return;
    }
    setGroupMembers([...groupMembers, newMember]);
    handleAnyChange(); // Mark change and enable Finalize
  };

  // Remove a group member
  const handleRemoveMember = (memberName: string) => {
    setGroupMembers(groupMembers.filter((member) => member !== memberName));
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[memberName];
      handleAnyChange(); // Mark change and enable Finalize
      return updatedData;
    });
  };

  // Rename a group member
  const handleRenameMember = (oldName: string, newName: string) => {
    setGroupMembers((prevMembers) =>
      prevMembers.map((member) => (member === oldName ? newName : member))
    );
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[newName] = updatedData[oldName];
      delete updatedData[oldName];
      handleAnyChange(); // Mark change and enable Finalize
      return updatedData;
    });
  };

  // Finalize the split and show summary
  const handleFinalize = () => {
    setShowSummary(true); // Show summary
    setFinalizeDisabled(true); // Disable the finalize button
  };

  const handleFinalizeDisabledChange = (disabled: boolean) => {
    setFinalizeDisabled(disabled);
  };

  if (loading) {
    return <p>Loading receipt data...</p>;
  }

  if (error) {
    return <p>{error}</p>; // Display error if something goes wrong
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20 mb-4">
      <h2 className="text-white text-2xl font-bold mb-6">Receipt Splitter</h2>

      {receiptUrl && (
        <div className="my-6 grid justify-center">
          <Image
            src={receiptUrl}
            alt="Uploaded Receipt"
            width={400}
            height={400}
          />
        </div>
      )}

      {receiptItems.length > 0 ? (
        <>
          <SplitTable
            receiptItems={receiptItems}
            groupMembers={groupMembers}
            onToggleSplit={handleToggleSplit}
            splitData={splitData}
            onRemoveMember={handleRemoveMember}
            onRenameMember={handleRenameMember}
            onFinalizeDisabledChange={handleFinalizeDisabledChange}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
          <div className="my-6">
            <input
              type="text"
              placeholder="Add new group member"
              className="bg-transparent text-lg text-white border-b border-gray-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const newMember = (e.target as HTMLInputElement).value.trim();
                  if (newMember) {
                    handleAddMember(newMember);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
          </div>{" "}
          <button
            onClick={handleFinalize}
            className={`text-white px-4 py-2 mt-4 rounded-lg ${
              finalizeDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={finalizeDisabled} // Disable based on state
          >
            Finalize
          </button>
        </>
      ) : (
        <p className="text-gray-400">No receipt data available.</p>
      )}

      {/* Show FinalizeSummary only after finalization */}
      {showSummary && (
        <FinalizeSummary
          receiptItems={receiptItems}
          groupMembers={groupMembers}
          splitData={splitData}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default function SplitPage() {
  return (
    <Suspense fallback={<p>Loading split page...</p>}>
      <ReceiptProvider>
        <SplitPageContent />
      </ReceiptProvider>
    </Suspense>
  );
}
