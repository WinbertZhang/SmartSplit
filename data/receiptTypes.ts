// Define the structure for an individual receipt item
export interface ReceiptItem {
  id: number;
  item: string;
  price: number;
  splitters?: string[];  // List of people splitting this item
}

// Define the structure for the receipt data from Firestore
export interface ReceiptData {
  id?: string; // ID of the receipt in Firestore
  userId: string;  // ID of the user who owns the receipt
  items: ReceiptItem[];  // Array of items on the receipt
  subtotal: number;  // Subtotal of the receipt
  tax: number;  // Tax on the receipt
  tip?: number;  // Optional tip amount
  total: number;  // Total amount of the receipt
  name?: string;  // Optional name of the receipt
  category?: string;  // Optional category of the receipt
  receiptUrl: string;  // Image URL of the receipt
  createdAt: Date;  // Date when the receipt was created
  splitDetails: { name: string; amount: number }[];  // Details of the amount each person owes
}
