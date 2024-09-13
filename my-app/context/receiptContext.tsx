import { createContext, useContext, useState, ReactNode } from "react";

interface ReceiptContextType {
  imageUrl: string | null;
  setImageUrl: (url: string) => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export const ReceiptProvider = ({ children }: { children: ReactNode }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <ReceiptContext.Provider value={{ imageUrl, setImageUrl }}>
      {children}
    </ReceiptContext.Provider>
  );
};

export const useReceipt = () => {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error("useReceipt must be used within a ReceiptProvider");
  }
  return context;
};
