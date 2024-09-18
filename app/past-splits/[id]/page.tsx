"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation"; // To retrieve the `id` from the URL
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore functions
import { db } from "@/lib/firebaseConfig"; // Firebase configuration
import ReadOnlySplitTable from "@/components/readOnlySplitTable"; // Import read-only split table component
import FinalizeSummary from "@/components/finalizeSummary"; // Import summary component for finalizing splits
import { toast, ToastContainer } from "react-toastify"; // Toast notifications for user feedback
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS for notifications
import Image from "next/image"; // Next.js optimized image component
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes"; // Import receipt types

export default function PastSplitsView() {
  const { id } = useParams(); // Get the `id` of the receipt from the URL
  const receiptId = Array.isArray(id) ? id[0] : id; // Ensure `id` is a string (handle array case)

  // State for managing receipt and split details
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({});
  const [memberOwedAmounts, setMemberOwedAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [error, setError] = useState<string | null>(null); // Error state for any issues

  // Function to fetch receipt data from Firestore using the receipt ID
  const fetchReceiptData = useCallback(async () => {
    try {
      const receiptRef = doc(db, "expenses", receiptId); // Reference to the specific receipt document
      const receiptSnap = await getDoc(receiptRef); // Fetch the document snapshot

      if (receiptSnap.exists()) {
        // If the document exists, retrieve its data and set it to state
        const data = receiptSnap.data() as ReceiptData;
        setReceiptItems(data.items);
        setReceiptUrl(data.receiptUrl || null); // Set receipt image URL
        setSubtotal(data.subtotal || 0);
        setTax(data.tax || 0);
        setTotal(data.total || 0);
        setGroupMembers(data.splitDetails.map((detail) => detail.name)); // Set group members' names

        // Set amounts owed by each member
        const amounts: Record<string, number> = {};
        data.splitDetails.forEach((detail) => {
          amounts[detail.name] = detail.amount;
        });
        setMemberOwedAmounts(amounts);

        // Create the split data structure, mapping members to the items they are splitting
        const splitInfo: Record<string, Set<number>> = {};
        data.items.forEach((item) => {
          if (item.splitters) {
            item.splitters.forEach((splitter) => {
              if (!splitInfo[splitter]) {
                splitInfo[splitter] = new Set();
              }
              splitInfo[splitter].add(item.id); // Add item IDs to the split list for each member
            });
          }
        });
        setSplitData(splitInfo);
      } else {
        // Handle case where the document does not exist
        toast.error("No such document exists.");
        setError("No such document exists.");
      }
    } catch (error) {
      // Handle errors during data fetching
      toast.error("Error fetching receipt data.");
      setError("Error fetching receipt data.");
    } finally {
      setLoading(false); // Stop loading once data is fetched or error occurs
    }
  }, [receiptId]);

  // Fetch receipt data when the component mounts
  useEffect(() => {
    fetchReceiptData();
  }, [fetchReceiptData]);

  // Loading state: display a message while data is being fetched
  if (loading) {
    return <p>Loading receipt data...</p>;
  }

  // Error state: display an error message if something went wrong
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20 mb-4">
      <h2 className="text-white text-2xl font-bold mb-6">Receipt Summary</h2>

      {/* Display receipt image if available */}
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

      {/* Display receipt items and split details if available */}
      {receiptItems.length > 0 ? (
        <>
          {/* Read-only table for viewing split data */}
          <ReadOnlySplitTable
            receiptItems={receiptItems}
            groupMembers={groupMembers}
            splitData={splitData}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />

          {/* Summary component for finalizing the split view */}
          <FinalizeSummary
            groupMembers={groupMembers}
            memberOwedAmounts={memberOwedAmounts}
          />
        </>
      ) : (
        <p className="text-gray-400">No receipt data available.</p>
      )}

      <ToastContainer />
    </div>
  );
}
