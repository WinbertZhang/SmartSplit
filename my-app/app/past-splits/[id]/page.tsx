"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation"; // To get the `id` from the URL and handle navigation
import { doc, getDoc } from "firebase/firestore"; // For Firestore interaction
import { db } from "@/lib/firebaseConfig"; // Firebase configuration
import ReadOnlySplitTable from "@/components/readOnlySplitTable"; // Import the read-only split table
import FinalizeSummary from "@/components/finalizeSummary"; // Summary Component
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes"; // Import types

export default function PastSplitsView() {
  const { id } = useParams(); // Get the receipt ID from the URL
  const receiptId = Array.isArray(id) ? id[0] : id; // Ensure `id` is a string
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({});
  const [memberOwedAmounts, setMemberOwedAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Handle errors

  const fetchReceiptData = useCallback(async () => {
    try {
      const receiptRef = doc(db, "expenses", receiptId); // Fetch the receipt based on the ID from params
      const receiptSnap = await getDoc(receiptRef);

      if (receiptSnap.exists()) {
        const data = receiptSnap.data() as ReceiptData;
        setReceiptItems(data.items);
        setReceiptUrl(data.receiptUrl || null); // Fallback to Firebase URL
        setSubtotal(data.subtotal || 0);
        setTax(data.tax || 0);
        setTotal(data.total || 0);
        setGroupMembers(data.splitDetails.map((detail) => detail.name)); // Set group members

        const amounts: Record<string, number> = {};
        data.splitDetails.forEach((detail) => {
          amounts[detail.name] = detail.amount;
        });
        setMemberOwedAmounts(amounts);

        // Create the split data structure
        const splitInfo: Record<string, Set<number>> = {};
        data.items.forEach((item) => {
          item.splitters.forEach((splitter) => {
            if (!splitInfo[splitter]) {
              splitInfo[splitter] = new Set();
            }
            splitInfo[splitter].add(item.id);
          });
        });
        setSplitData(splitInfo);
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
  }, [receiptId]);

  useEffect(() => {
    fetchReceiptData(); // Fetch receipt data when component mounts
  }, [fetchReceiptData]);

  if (loading) {
    return <p>Loading receipt data...</p>;
  }

  if (error) {
    return <p>{error}</p>; // Display error if something goes wrong
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20 mb-4">
      <h2 className="text-white text-2xl font-bold mb-6">Receipt Summary</h2>

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
          {/* ReadOnlySplitTable */}
          <ReadOnlySplitTable
            receiptItems={receiptItems}
            groupMembers={groupMembers}
            splitData={splitData}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />

          {/* FinalizeSummary is always visible in view-only mode */}
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
