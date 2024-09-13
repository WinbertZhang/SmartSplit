import { db, storage } from "./firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  DocumentData,
  QuerySnapshot,
  FieldValue,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Function to upload image to Firebase Storage and return the URL
export async function uploadImageToFirebaseStorage(imageFile: File): Promise<string | null> {
  try {
    const storageRef = ref(storage, `receipts/${imageFile.name}`); // Create a reference to the image in Firebase Storage
    await uploadBytes(storageRef, imageFile); // Upload the image
    const downloadURL = await getDownloadURL(storageRef); // Get the download URL
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    throw new Error("Error uploading image to Firebase Storage");
  }
}

// Function to save receipt items and return the unique receipt ID
export async function saveReceiptItemsToFirestore(
  userId: string,
  receiptData: any
): Promise<string> {
  try {
    const expensesCollection = collection(db, "expenses");

    // Add the receipt data to Firestore and return the unique receipt ID
    const receiptDocRef = await addDoc(expensesCollection, {
      ...receiptData,
      userId: userId,
      createdAt: serverTimestamp(),
    });

    console.log("Receipt saved with ID:", receiptDocRef.id);
    return receiptDocRef.id; // Return the unique ID
  } catch (error) {
    console.error("Error saving receipt items to Firestore:", error);
    throw new Error("Error saving receipt items");
  }
}

// Other Firestore functions, like creating groups, adding expenses, etc.
export interface Group {
  id?: string; // Optional for local state before Firestore assignment
  groupName: string;
  adminId: string;
  members: string[];
  createdAt?: Date;
}

export interface Expense {
  id?: string;
  groupId: string;
  userId: string;
  title: string;
  total: number;
  tax: number;
  subtotal: number;
  category: string;
  sharedWith: string[];
  splitDetails: { userId: string; amount: number }[];
  receiptUrl?: string;
  createdAt?: Date;
  items: {
    id: number;
    item: string;
    price: number;
    split: boolean;
  }[];
}

export interface Invitation {
  email: string;
  groupId: string;
  status: "pending" | "accepted";
  createdAt: FieldValue;
}

// Create a new group
export const createGroup = async (
  groupName: string,
  adminId: string,
  members: string[]
): Promise<string | void> => {
  try {
    const groupData = {
      groupName,
      adminId,
      members,
      createdAt: serverTimestamp(),
    };

    const groupDocRef = await addDoc(collection(db, "groups"), groupData);
    console.log("Group created with ID:", groupDocRef.id);
    return groupDocRef.id;
  } catch (error) {
    console.error("Error creating group:", error);
  }
};

// Log invitation to Firestore
export const logInvitation = async (
  email: string,
  groupId: string
): Promise<void> => {
  try {
    const invitationData: Invitation = {
      email,
      groupId,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "invitations"), invitationData);
    console.log("Invitation logged for:", email);
  } catch (error) {
    console.error("Error logging invitation:", error);
  }
};

// Add an expense to Firestore
export const addExpenseToGroup = async (
  expense: Omit<Expense, "id" | "createdAt">
): Promise<void> => {
  try {
    await addDoc(collection(db, "expenses"), {
      ...expense,
      createdAt: serverTimestamp() as FieldValue,
    });
    console.log("Expense added successfully!");
  } catch (error) {
    console.error("Error adding expense:", error);
  }
};

// Fetch expenses for a specific group
export const fetchGroupExpenses = async (
  groupId: string
): Promise<Expense[]> => {
  try {
    const q = query(
      collection(db, "expenses"),
      where("groupId", "==", groupId)
    );
    const querySnapshot = await getDocs(q);

    const expenses: Expense[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Expense), // Type assertion for Expense
    }));

    return expenses;
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return [];
  }
};

// Fetch groups for a user
export const fetchUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", userId)
    );
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    const groups: Group[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Group), // Type assertion for Group
    }));

    return groups;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
};
