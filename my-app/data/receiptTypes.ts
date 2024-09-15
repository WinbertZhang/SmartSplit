// Define the structure for an individual receipt item
export interface ReceiptItem {
  id: number;
  item: string;
  price: number;
  splitters: string[];  // List of people splitting this item
}

// Define the structure for the receipt data from Firestore
export interface ReceiptData {
  id?: string; // ID of the receipt in Firestore
  userId: string;  // ID of the user who owns the receipt
  items: ReceiptItem[];  // Array of items on the receipt
  subtotal: number;  // Subtotal of the receipt
  tax: number;  // Tax on the receipt
  total: number;  // Total amount of the receipt
  receiptUrl?: string;  // Optional image URL of the receipt
  createdAt: Date;  // Date when the receipt was created
  splitDetails: { name: string; amount: number }[];  // Details of the amount each person owes
}
