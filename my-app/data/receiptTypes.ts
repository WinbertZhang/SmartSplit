// Define the structure for an individual receipt item
export interface ReceiptItem {
    id: number;
    item: string;
    price: number;
  }
  
  // Define the structure for the receipt data from Firestore
  export interface ReceiptData {
    userId: string;  // ID of the user who owns the receipt
    items: ReceiptItem[];  // Array of items on the receipt
    subtotal: number;  // Subtotal of the receipt
    tax: number;  // Tax on the receipt
    total: number;  // Total amount of the receipt
    receiptUrl?: string;  // Optional image URL of the receipt
  }
  