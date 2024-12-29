"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebaseConfig";
import SplitTable from "@/components/splitTable";
import FinalizeSummary from "@/components/finalizeSummary";
import Image from "next/image";
import { ReceiptData, ReceiptItem } from "@/data/receiptTypes";
import { useReceipt, ReceiptProvider } from "@/context/receiptContext";
import { saveSplitToFirestore } from "@/lib/firebaseUtils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showErrorToast, showSuccessToast } from "@/components/toastNotifications";

function SplitPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const { imageUrl } = useReceipt();
  const receiptId = Array.isArray(id) ? id[0] : id;
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [splitData, setSplitData] = useState<Record<string, Set<number>>>({});
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [finalizeDisabled, setFinalizeDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberOwedAmounts, setMemberOwedAmounts] = useState<Record<string, number>>({});
  const auth = getAuth();
  const [user, setUser] = useState<any>(null); // <-- track user state

  // We'll also store guest data if user is not logged in
  // In a real app, you could retrieve guest data from localStorage or context
  const [guestReceiptData, setGuestReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, [auth]);

  // Retrieve receipt data from Firestore if logged in
  const fetchReceiptData = useCallback(
    async (userId: string, userName: string) => {
      try {
        const receiptRef = doc(db, "expenses", receiptId);
        const receiptSnap = await getDoc(receiptRef);

        if (receiptSnap.exists()) {
          const data = receiptSnap.data() as ReceiptData;
          if (data.userId !== userId) {
            showErrorToast("You are not authorized to view this receipt.");
            setError("You are not authorized to view this receipt.");
          } else {
            setReceiptItems(data.items);
            setReceiptUrl(data.receiptUrl || null);
            setSubtotal(data.subtotal || 0);
            setTax(data.tax || 0);
            setTip(data.tip || 0);
            setTotal(data.total || 0);

            setGroupMembers([userName]);
            const allItemsSet = new Set(data.items.map((item) => item.id));
            setSplitData({ [userName]: allItemsSet });
            setFinalizeDisabled(false);
          }
        } else {
          showErrorToast("No such document exists.");
          setError("No such document exists.");
        }
      } catch (err) {
        showErrorToast("Error fetching receipt data.");
        setError("Error fetching receipt data.");
      } finally {
        setLoading(false);
      }
    },
    [receiptId]
  );

  // On mount, decide if user is logged in or not. If user is not logged in, we attempt to load "guest" data.
  useEffect(() => {
    if (!user) {
      // If user is not logged in, handle guest data
      // for example, read from localStorage if it was saved in upload-receipt
      const localData = localStorage.getItem("guestReceiptData");
      if (localData) {
        const parsed = JSON.parse(localData) as ReceiptData;
        setGuestReceiptData(parsed);
        setReceiptItems(parsed.items);
        setReceiptUrl(parsed.receiptUrl || null);
        setSubtotal(parsed.subtotal || 0);
        setTax(parsed.tax || 0);
        setTip(parsed.tip || 0);
        setTotal(parsed.total || 0);

        // For guest, pick a default name
        const guestName = "Me";
        setGroupMembers([guestName]);
        const allItemsSet = new Set(parsed.items.map((item) => item.id));
        setSplitData({ [guestName]: allItemsSet });
      } 
      setLoading(false);
    } else {
      // If user is logged in
      const userName = user.displayName?.split(" ")[0] || user.uid;
      if (imageUrl) {
        // If we have an imageUrl in context, use that
        setReceiptUrl(imageUrl);
        setGroupMembers([userName]);
        setFinalizeDisabled(false);
        setLoading(false);
      } else {
        // otherwise fetch from Firestore
        fetchReceiptData(user.uid, userName);
      }
    }
  }, [user, fetchReceiptData, imageUrl]);

  const handleAnyChange = () => {
    setFinalizeDisabled(false);
    setShowSummary(false);
  };

  const handleToggleSplit = (itemId: number, memberName: string) => {
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      const memberSet = new Set(updatedData[memberName] || []);
      if (memberSet.has(itemId)) {
        memberSet.delete(itemId);
      } else {
        memberSet.add(itemId);
      }
      updatedData[memberName] = memberSet;
      handleAnyChange();
      return updatedData;
    });
  };

  const handleAddMember = (newMember: string) => {
    if (groupMembers.length >= 10) {
      showErrorToast("You can't add more than 10 members!");
      return;
    }
    if (groupMembers.includes(newMember)) {
      showErrorToast("Member already exists!");
      return;
    }
    setGroupMembers([...groupMembers, newMember]);
    handleAnyChange();
  };

  const handleRemoveMember = (memberName: string) => {
    setGroupMembers(groupMembers.filter((member) => member !== memberName));
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[memberName];
      handleAnyChange();
      return updatedData;
    });
  };

  const handleRenameMember = (oldName: string, newName: string) => {
    if (groupMembers.includes(newName)) {
      showErrorToast("Member already exists!");
      return;
    }
    setGroupMembers((prevMembers) =>
      prevMembers.map((member) => (member === oldName ? newName : member))
    );
    setSplitData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[newName] = updatedData[oldName];
      delete updatedData[oldName];
      handleAnyChange();
      return updatedData;
    });
  };

  const handleFinalize = async () => {
    const memberOwedAmounts: Record<string, number> = {};

    // Prepare updated items with splitters
    const updatedItems = receiptItems.map((item) => ({
      ...item,
      splitters: groupMembers.filter((member) => splitData[member]?.has(item.id)),
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

    // Proportional tax and tip
    Object.keys(memberOwedAmounts).forEach((member) => {
      const memberSubtotalShare = memberOwedAmounts[member];
      const memberTaxShare = (memberSubtotalShare / subtotal) * tax;
      const memberTipShare = (memberSubtotalShare / subtotal) * tip;
      memberOwedAmounts[member] =
        memberSubtotalShare + memberTaxShare + memberTipShare;
    });

    // If user is logged in, save to Firestore
    if (user) {
      try {
        const splitDetails = groupMembers.map((member) => ({
          name: member,
          amount: memberOwedAmounts[member],
        }));
        await saveSplitToFirestore(receiptId, splitDetails, updatedItems);
        showSuccessToast("Split details saved successfully!");
      } catch (error) {
        showErrorToast("Error saving split details to Firestore.");
      }
    } else {
      // If not logged in, do not save to Firestore
      showSuccessToast("Split details calculated (guest mode). No data saved.");
      // Optionally store in localStorage or just show ephemeral summary
    }

    setMemberOwedAmounts(memberOwedAmounts);
    setShowSummary(true);
    setFinalizeDisabled(true);
  };

  if (loading) {
    return <p>Loading receipt data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#212C40] p-6 rounded-lg shadow-md text-center mt-20 mb-4">
      <h2 className="text-white text-2xl font-bold mb-6">Receipt Splitter</h2>

      {receiptUrl && (
        <div className="my-6 grid justify-center">
          <Image src={receiptUrl} alt="Uploaded Receipt" width={400} height={400} />
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
            onFinalizeDisabledChange={setFinalizeDisabled}
            subtotal={subtotal}
            tax={tax}
            tip={tip}
            total={total}
          />

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
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
              id="new-member-input"
            />
            <button
              onClick={() => {
                const input = document.getElementById("new-member-input") as HTMLInputElement;
                const newMember = input.value.trim();
                if (newMember) {
                  handleAddMember(newMember);
                  input.value = "";
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Add
            </button>
          </div>

          <button
            onClick={handleFinalize}
            className={`text-white px-4 py-2 mt-4 rounded-lg ${
              finalizeDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={finalizeDisabled}
          >
            Finalize
          </button>
        </>
      ) : (
        <p className="text-gray-400">No receipt data available.</p>
      )}

      {showSummary && (
        <FinalizeSummary
          groupMembers={groupMembers}
          memberOwedAmounts={memberOwedAmounts}
        />
      )}
    </div>
  );
}

export default function SplitPage() {
  return (
    <ReceiptProvider>
      <Suspense fallback={<p>Loading split page...</p>}>
        <SplitPageContent />
      </Suspense>
      <ToastContainer />
    </ReceiptProvider>
  );
}