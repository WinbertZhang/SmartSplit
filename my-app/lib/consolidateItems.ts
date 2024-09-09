export const consolidateItems = (items: Record<string, string>) => {
    const consolidated: Record<string, number> = {};
  
    Object.keys(items).forEach((key) => {
      // Ignore non-item entries
      if (["SUBTOTAL", "TAX", "TOTAL", "VISA"].includes(key)) return;
  
      // Parse the price as a float
      const price = parseFloat(items[key]);
  
      // Add price to the existing item or initialize it
      if (consolidated[key]) {
        consolidated[key] += price;
      } else {
        consolidated[key] = price;
      }
    });
  
    return consolidated;
  };
  