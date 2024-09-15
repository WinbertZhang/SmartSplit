import { db, storage } from "./firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc,
  FieldValue,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { ReceiptData, ReceiptItem} from "@/data/receiptTypes";


// Function to check if user is logged in
export const checkAuthState = (callback: (user: any) => void, redirectToLogin: () => void) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      redirectToLogin();
    }
  });
};

// Function to save receipt data with split details to Firestore
export async function saveSplitToFirestore(
  receiptId: string,
  splitDetails: { name: string; amount: number }[],
  updatedItems: ReceiptItem[] // Array of updated items with splitters
): Promise<void> {
  try {
    const receiptRef = doc(db, "expenses", receiptId);

    // Update the split details and items in Firestore
    await updateDoc(receiptRef, {
      splitDetails: splitDetails,
      items: updatedItems, // Update the items with splitters
    });

    console.log("Split details and items updated successfully!");
  } catch (error) {
    console.error("Error updating split details and items:", error);
    throw new Error("Error updating split details and items");
  }
}

// Function to upload an image to Firebase Storage and return the URL
export async function uploadImageToFirebaseStorage(imageFile: File, userId: string): Promise<string | null> {
  try {
    const storageRef = ref(storage, `receipts/${userId}/${uuidv4()}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    throw new Error("Error uploading image to Firebase Storage");
  }
}

// Function to save receipt items and return the unique receipt ID
export async function saveReceiptItemsToFirestore(
  userId: string,
  receiptData: ReceiptData
): Promise<string> {
  try {
    const expensesCollection = collection(db, "expenses");

    // Add the receipt data to Firestore
    const receiptDocRef = await addDoc(expensesCollection, {
      ...receiptData,
      userId: userId,
      createdAt: serverTimestamp(),
    });

    console.log("Receipt saved with ID:", receiptDocRef.id);
    return receiptDocRef.id;
  } catch (error) {
    console.error("Error saving receipt items to Firestore:", error);
    throw new Error("Error saving receipt items");
  }
}

// Fetch all expenses (receipts) for a specific user
export const fetchUserExpenses = async (userId: string): Promise<ReceiptData[]> => {
  try {
    const q = query(collection(db, "expenses"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const expenses: ReceiptData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ReceiptData),
      createdAt: doc.data().createdAt.toDate() // Ensure that createdAt is converted to a Date object
    }));

    return expenses;
  } catch (error) {
    console.error("Error fetching user expenses:", error);
    return [];
  }
};

// Function to fetch a specific receipt data from Firestore
export const fetchReceiptData = async (receiptId: string, userId: string): Promise<ReceiptData> => {
  try {
    const receiptRef = doc(db, "expenses", receiptId);
    const receiptSnap = await getDoc(receiptRef);

    if (receiptSnap.exists()) {
      const data = receiptSnap.data() as ReceiptData;
      if (data.userId !== userId) {
        throw new Error("Unauthorized access");
      }
      return { ...data, createdAt: data.createdAt };
    } else {
      throw new Error("No such document");
    }
  } catch (error) {
    throw error;
  }
};

