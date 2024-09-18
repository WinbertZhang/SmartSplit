import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

// Get API key for Google Generative AI from environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Throw an error if the API key is not set
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Initialize the Google Generative AI client with the appropriate model configuration
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash', 
  generationConfig: { responseMimeType: "application/json" } 
});

// Convert a file's base64 data and MIME type into a format that can be used by Generative AI
function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

// Safely parse and repair a JSON string; return null if the string is not valid JSON
function sanitizeJSONResponse(jsonString: string) {
  try {
    const repairedJson = jsonrepair(jsonString); // Attempt to repair malformed JSON
    const jsonObject = JSON.parse(repairedJson); // Parse the repaired JSON string
    return jsonObject; 
  } catch (error) {
    return null; // Return null if parsing fails
  }
}

// Remove any items from the JSON object that appear after the 'total' field
function removeItemsAfterTotal(jsonObject: any) {
  let totalIndex = -1;
  const entries = Object.entries(jsonObject);

  // Loop through the entries to find the index of the 'total' field
  for (let i = 0; i < entries.length; i++) {
    const [key] = entries[i];
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey.includes('total')) {
      totalIndex = i; // Mark the index where the 'total' field is found
      break;
    }
  }

  // If no 'total' field is found, return the original object
  if (totalIndex === -1) {
    return jsonObject;
  }

  // Slice off the entries after the 'total' field and return the cleaned JSON
  const filteredEntries = entries.slice(0, totalIndex + 1);
  const cleanedJson = Object.fromEntries(filteredEntries);
  return cleanedJson;
}

// Handle POST requests for receipt image processing
export async function POST(req: NextRequest) {
  try {
    // Parse the form data and retrieve the uploaded image file
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    // Validate that an image was uploaded
    if (!imageFile) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 });
    }

    // Convert the image file to a base64 string
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type;

    // Ensure the file is an image
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
    }

    // Prepare the image data to be used by Generative AI
    const imagePart = fileToGenerativePart(base64Data, mimeType);

    // Prompt 1: Ask AI to extract items and prices from the receipt
    const firstPrompt = "Please return a JSON block with all the items and their prices in this format extracted from the uploaded receipt. Make sure to include discounts and negative numbers.";
    const firstResult = await model.generateContent([firstPrompt, imagePart]);

    // Extract the text from the AI response
    const extractedJson = firstResult.response.text();

    // Sanitize and parse the extracted JSON
    const parsedJson = sanitizeJSONResponse(extractedJson);
    if (!parsedJson) {
      return NextResponse.json({ error: 'Failed to extract valid JSON from the first prompt.' }, { status: 500 });
    }

    // Prompt 2: Clean up the extracted JSON for better readability
    const secondPrompt = `Here is a json output from OCR extracted key values from a receipt. Please clean up all the keys and values based on these rules:
    {
      "Item Name": "$Price"
    }
    - All keys should be human readable (e.g. Bounty Paper Towels)
    - Values with a discount code such as (-A) should be returned as negative price value
    
    ${JSON.stringify(parsedJson)}`;

    // Generate the cleaned output from AI
    const secondResult = await model.generateContent([secondPrompt]);
    const cleanedJson = secondResult.response.text();

    // Sanitize and parse the cleaned JSON
    const sanitizedCleanedJson = sanitizeJSONResponse(cleanedJson);
    if (!sanitizedCleanedJson) {
      return NextResponse.json({ error: 'Failed to parse cleaned JSON.' }, { status: 500 });
    }

    // Remove any items that appear after the 'total' field
    const sanitizedCleanedNoTotalJson = removeItemsAfterTotal(sanitizedCleanedJson);

    // Return the cleaned and sanitized JSON in the response
    return NextResponse.json({ cleanedJson: sanitizedCleanedNoTotalJson }, { status: 200 });

  } catch (error) {
    // Return a 500 error if there is a failure during processing
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}