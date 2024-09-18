"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useParams } from "next/navigation"; // Retrieve `id` from the URL and handle navigation
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore interaction
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth for user authentication
import { db } from "@/lib/firebaseConfig"; // Firebase configuration
import SplitTable from "@/components/splitTable"; // SplitTable component for handling item splits
import FinalizeSummary from "@/components/finalizeSummary"; // FinalizeSummary component to show final amounts
import { toast, ToastContainer } from "react-toastify"; // Toast for user notifications
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import Image from "next/image"; // Optimized image handling in Next.js
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes"; // Types for receipt data and items
import { useReceipt, ReceiptProvider } from "@/context/receiptContext"; // Context for receipt data
import { saveSplitToFirestore } from "@/lib/firebaseUtils"; // Function to save split data to Firestore

function SplitPageContent() {
  const { id } = useParams(); // Get the receipt ID from the URL
  const { imageUrl } = useReceipt(); // Get the image URL from the context
  const receiptId = Array.isArray(id) ? id[0] : id; // Ensure `id` is a string
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null); // State for the receipt URL
  const [subtotal, setSubtotal] = useState<number>(0); // Subtotal for the receipt
  const [tax, setTax] = useState<number>(0); // Tax for the receipt
  const [total, setTotal] = useState<number>(0); // Total amount for the receipt
  const [groupMembers, setGroupMembers] = useState<string[]>([]); // State to manage group members
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({}); // State for tracking which items each member is splitting
  const [showSummary, setShowSummary] = useState<boolean>(false); // Control for showing the final summary
  const [finalizeDisabled, setFinalizeDisabled] = useState<boolean>(false); // Control for disabling Finalize button
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [error, setError] = useState<string | null>(null); // Error state
  const [memberOwedAmounts, setMemberOwedAmounts] = useState<
    Record<string, number>
  >({}); // Amount each member owes
  const auth = getAuth(); // Get Firebase Auth instance

  // Function to fetch receipt data from Firestore
  const fetchReceiptData = useCallback(
    async (userId: string, userName: string) => {
      try {
        const receiptRef = doc(db, "expenses", receiptId); // Reference to the receipt document in Firestore
        const receiptSnap = await getDoc(receiptRef); // Fetch the document snapshot

        if (receiptSnap.exists()) {
          const data = receiptSnap.data() as ReceiptData;

          // Check if the logged-in user is the owner of the receipt
          if (data.userId !== userId) {
            toast.error("You are not authorized to view this receipt.");
            setError("You are not authorized to view this receipt.");
          } else {
            setReceiptItems(data.items); // Set the receipt items in state
            setReceiptUrl(data.receiptUrl || null); // Fallback to Firebase URL if available
            setSubtotal(data.subtotal || 0);
            setTax(data.tax || 0);
            setTotal(data.total || 0);

            setGroupMembers([userName]); // Set the logged-in user as the group member
            const allItemsSet = new Set(data.items.map((item) => item.id)); // Get all item IDs
            setSplitData({ [userName]: allItemsSet }); // Initialize split data with all items for the logged-in user
            setFinalizeDisabled(false); // Enable Finalize button
          }
        } else {
          toast.error("No such document exists.");
          setError("No such document exists.");
        }
      } catch (error) {
        toast.error("Error fetching receipt data.");
        setError("Error fetching receipt data.");
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    },
    [receiptId]
  );

  // Handle authentication state and fetch receipt data on component mount
  useEffect(() => {
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

  // Handle any changes and enable the Finalize button
  const handleAnyChange = () => {
    setFinalizeDisabled(false); // Enable the Finalize button when any change happens
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
    if (groupMembers.includes(newMember)) {
      toast.error("Member already exists!"); // Show error if duplicate name
      return;
    }
    setGroupMembers([...groupMembers, newMember]); // Add the new member to the group
    handleAnyChange(); // Mark change and enable Finalize
  };

  // Remove a group member
  const handleRemoveMember = (memberName: string) => {
    setGroupMembers(groupMembers.filter((member) => member !== memberName)); // Remove the member from the group
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[memberName]; // Remove the member from the split data
      handleAnyChange(); // Mark change and enable Finalize
      return updatedData;
    });
  };

  // Rename a group member
  const handleRenameMember = (oldName: string, newName: string) => {
    if (groupMembers.includes(newName)) {
      toast.error("Member already exists!"); // Show error if duplicate name
      return;
    }

    setGroupMembers((prevMembers) =>
      prevMembers.map((member) => (member === oldName ? newName : member))
    );
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[newName] = updatedData[oldName]; // Assign the old data to the new name
      delete updatedData[oldName]; // Remove the old name
      handleAnyChange(); // Mark change and enable Finalize
      return updatedData;
    });
  };

  // Finalize the split and save the data to Firestore
  const handleFinalize = async () => {
    const memberOwedAmounts: Record<string, number> = {};

    // Prepare updated items with splitters
    const updatedItems = receiptItems.map((item) => ({
      ...item,
      splitters: groupMembers.filter((member) =>
        splitData[member]?.has(item.id)
      ), // Add splitters
    }));

    // Calculate the amount each member owes based on item splits
    receiptItems.forEach((item) => {
      const membersSharingItem = groupMembers.filter((member) =>
        splitData[member]?.has(item.id)
      );
      const splitCost = item.price / membersSharingItem.length;
      membersSharingItem.forEach((member) => {
        memberOwedAmounts[member] =
          (memberOwedAmounts[member] || 0) + splitCost;
      });
    });

    // Calculate each member's share of the tax proportionally based on the subtotal they owe
    const memberOwedWithTax: Record<string, number> = {};
    Object.keys(memberOwedAmounts).forEach((member) => {
      const memberSubtotalShare = memberOwedAmounts[member];
      const memberTaxShare = (memberSubtotalShare / subtotal) * tax;
      memberOwedWithTax[member] = memberSubtotalShare + memberTaxShare;
    });

    // Create the split details array to be saved to Firestore
    const splitDetails = groupMembers.map((member) => ({
      name: member,
      amount: memberOwedWithTax[member],
    }));

    // Save the split details and items with splitters to Firestore
    try {
      await saveSplitToFirestore(receiptId, splitDetails, updatedItems); // Save splitters and amounts
      toast.success("Split details saved successfully!"); // Show success toast
    } catch (error) {
      toast.error("Error saving split details to Firestore."); // Show error toast
    }

    // Set the calculated amounts and show the summary
    setMemberOwedAmounts(memberOwedWithTax); // Update the state with the owed amounts
    setShowSummary(true); // Show summary
    setFinalizeDisabled(true); // Disable the finalize button
  };

  if (loading) {
    return <p>Loading receipt data...</p>; // Show loading message while data is being fetched
  }

  if (error) {
    return <p>{error}</p>; // Show error message if something goes wrong
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20 mb-4">
      <h2 className="text-white text-2xl font-bold mb-6">Receipt Splitter</h2>

      {/* Display the receipt image */}
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

      {/* If there are receipt items, show the SplitTable */}
      {receiptItems.length > 0 ? (
        <>
          <SplitTable
            receiptItems={receiptItems}
            groupMembers={groupMembers}
            onToggleSplit={handleToggleSplit}
            splitData={splitData}
            onRemoveMember={handleRemoveMember}
            onRenameMember={handleRenameMember}
            onFinalizeDisabledChange={setFinalizeDisabled}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />

          {/* Input field and button to add new group members */}
          <div className="my-6 flex justify-center items-center">
            <input
              type="text"
              placeholder="Add new group member"
              className="bg-transparent text-lg text-white border-b border-gray-400 focus:outline-none mr-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const newMember = (e.target as HTMLInputElement).value.trim();
                  if (newMember) {
                    handleAddMember(newMember);
                    (e.target as HTMLInputElement).value = ""; // Clear the input field after adding
                  }
                }
              }}
              id="new-member-input" // Add an ID to target the input field
            />
            <button
              onClick={() => {
                const input = document.getElementById(
                  "new-member-input"
                ) as HTMLInputElement;
                const newMember = input.value.trim();
                if (newMember) {
                  handleAddMember(newMember);
                  input.value = ""; // Clear the input field after adding
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Add
            </button>
          </div>

          {/* Finalize button */}
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
          groupMembers={groupMembers}
          memberOwedAmounts={memberOwedAmounts}
        />
      )}

      <ToastContainer />
    </div>
  );
}

// Component wrapped in ReceiptProvider and Suspense for better context management and loading state
export default function SplitPage() {
  return (
    <ReceiptProvider>
      <Suspense fallback={<p>Loading split page...</p>}>
        <SplitPageContent />
      </Suspense>
    </ReceiptProvider>
  );
}
