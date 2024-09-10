export async function processReceiptImage(uploadedImage: File) {
    const formData = new FormData();
    formData.append("image", uploadedImage);
    formData.append(
      "prompt",
      'Please return a JSON block with all the items and their prices in this format: { "ItemName": "$Price" }'
    );
  
    const res = await fetch("/api/gemini-parse", {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error("Failed to process receipt");
    }
  
    const jsonResponse = await res.json();
    return jsonResponse.cleanedJson;
  }
  