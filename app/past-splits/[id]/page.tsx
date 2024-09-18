"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import ReadOnlySplitTable from "@/components/readOnlySplitTable";
import FinalizeSummary from "@/components/finalizeSummary";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PastSplitsView() {
  const { id } = useParams();
  const receiptId = Array.isArray(id) ? id[0] : id;

  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({});
  const [memberOwedAmounts, setMemberOwedAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    "#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693",
    "#a059a0", "#5c53a5", "#4b8bbd", "#3c97b8", "#2d879f", "#1b658e"
  ];

  const fetchReceiptData = useCallback(async () => {
    try {
      const receiptRef = doc(db, "expenses", receiptId);
      const receiptSnap = await getDoc(receiptRef);

      if (receiptSnap.exists()) {
        const data = receiptSnap.data() as ReceiptData;
        setReceiptItems(data.items);
        setReceiptUrl(data.receiptUrl || null);
        setSubtotal(data.subtotal || 0);
        setTax(data.tax || 0);
        setTotal(data.total || 0);
        setGroupMembers(data.splitDetails.map((detail) => detail.name));

        const amounts: Record<string, number> = {};
        data.splitDetails.forEach((detail) => {
          amounts[detail.name] = detail.amount;
        });
        setMemberOwedAmounts(amounts);

        const splitInfo: Record<string, Set<number>> = {};
        data.items.forEach((item) => {
          if (item.splitters) {
            item.splitters.forEach((splitter) => {
              if (!splitInfo[splitter]) {
                splitInfo[splitter] = new Set();
              }
              splitInfo[splitter].add(item.id);
            });
          }
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
    fetchReceiptData();
  }, [fetchReceiptData]);

  const generatePeopleSplitData = () => {
    const memberNames = groupMembers;
    const amounts = groupMembers.map(member => memberOwedAmounts[member] || 0);

    return {
      labels: memberNames,
      datasets: [{
        data: amounts,
        backgroundColor: colors.slice(0, memberNames.length), // Use the palette, sliced to match the number of members
      }]
    };
  };

  if (loading) {
    return <p>Loading receipt data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
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
          <ReadOnlySplitTable
            receiptItems={receiptItems}
            groupMembers={groupMembers}
            splitData={splitData}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />

          {/* Chart.js Pie Chart for People */}
          <div className="my-6 pt-6" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Pie
              data={generatePeopleSplitData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: 'white', // Set legend text color to white
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        // Cast tooltipItem.raw to number and round to 2 decimal places
                        const value = Number(tooltipItem.raw);
                        return `${tooltipItem.label}: $${value.toFixed(2)}`;
                      }
                    },
                    bodyColor: 'white', // Set tooltip body text color to white
                  },
                },
              }}
              height={300}
              width={300}
            />

          </div>

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
