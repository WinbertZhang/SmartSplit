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
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-white text-lg">Loading receipt data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <div className="text-red-400 text-4xl mb-4">❌</div>
          <h2 className="text-white text-xl font-bold mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-24 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Split Your <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Receipt</span>
          </h1>
          <p className="text-white/80">Assign items to group members and calculate fair splits</p>
        </div>

        <div className="grid gap-8">
          
          {/* Receipt Image - Top on mobile, left on desktop */}
          {receiptUrl && (
            <div className="lg:hidden">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <h3 className="text-white text-lg font-semibold mb-4 text-center">Receipt</h3>
                <div className="relative max-w-sm mx-auto">
                  <Image 
                    src={receiptUrl} 
                    alt="Uploaded Receipt" 
                    width={400} 
                    height={600}
                    className="w-full h-auto rounded-xl shadow-lg border border-white/10"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Receipt Image - Desktop only */}
            {receiptUrl && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-8">
                  <h3 className="text-white text-lg font-semibold mb-4 text-center">Receipt</h3>
                  <div className="relative">
                    <Image 
                      src={receiptUrl} 
                      alt="Uploaded Receipt" 
                      width={400} 
                      height={600}
                      className="w-full h-auto rounded-xl shadow-lg border border-white/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`${receiptUrl ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              
              {receiptItems.length > 0 ? (
                <div className="space-y-6">
                  
                  {/* Split Table Container */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
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
                  </div>

                  {/* Add Member Section */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-blue-400">👥</span>
                      Add Group Member
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter member name..."
                        className="flex-1 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
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
                        className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-200 font-medium shadow-lg hover:shadow-green-400/25"
                      >
                        Add
                      </button>
                    </div>
                    {groupMembers.length >= 10 && (
                      <p className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
                        <span>⚠️</span>
                        Maximum of 10 members allowed
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleFinalize}
                      disabled={finalizeDisabled}
                      className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        finalizeDisabled
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-400 to-blue-500 text-white hover:scale-105 hover:shadow-2xl hover:shadow-green-400/25"
                      }`}
                    >
                      {finalizeDisabled ? "Split Calculated ✓" : "Calculate Split 🧮"}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-white text-xl font-semibold mb-2">No Receipt Data</h3>
                  <p className="text-gray-400">No receipt data is available for this split.</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Summary Section */}
        {showSummary && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <FinalizeSummary
                groupMembers={groupMembers}
                memberOwedAmounts={memberOwedAmounts}
              />
            </div>
          </div>
        )}

      </div>
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