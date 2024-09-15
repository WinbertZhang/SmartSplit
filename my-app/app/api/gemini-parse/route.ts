import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

// Check if the API key is present and throw an error if not
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });

function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

function sanitizeJSONResponse(jsonString: string) {
  try {
    const repairedJson = jsonrepair(jsonString);
    const jsonObject = JSON.parse(repairedJson);
    return jsonObject;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

function removeItemsAfterTotal(jsonObject: any) {
  let totalIndex = -1;

  // Iterate through the object to find the total
  const entries = Object.entries(jsonObject);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];

    // Check if the key is something like "Total" or "TOTAL"
    const normalizedKey = key.trim().toLowerCase();
    if (normalizedKey.includes('total')) {
      totalIndex = i; // Mark the index of the total
      break;
    }
  }

  if (totalIndex === -1) {
    // If no total is found, return the object as is
    return jsonObject;
  }

  // Filter out any items that come after the total
  const filteredEntries = entries.slice(0, totalIndex + 1);

  // Convert the filtered entries back to an object
  const cleanedJson = Object.fromEntries(filteredEntries);

  return cleanedJson;
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 });
    }

    // Convert the uploaded image to a base64 string
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type;

    // Ensure the file is an accepted image type
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
    }

    // Prepare the image part for the Google Generative AI request
    const imagePart = fileToGenerativePart(base64Data, mimeType);

    // First API call with the initial prompt and image
    const firstPrompt = "Please return a JSON block with all the items and their prices in this format extracted from the uploaded receipt. Make sure to include discounts and negative numbers.";
    const firstResult = await model.generateContent([firstPrompt, imagePart]);

    const extractedJson = firstResult.response.text();
    console.log('First prompt result (extracted JSON):', extractedJson);

    // Ensure valid JSON response
    const parsedJson = sanitizeJSONResponse(extractedJson);
    if (!parsedJson) {
      return NextResponse.json({ error: 'Failed to extract valid JSON from the first prompt.' }, { status: 500 });
    }

    // Second API call with the cleaned-up prompt
    const secondPrompt = `Here is a json output from OCR extracted key values from a receipt. Please clean up all the keys and values based on these rules:
    {
      "Item Name": "$Price"
    }
    - All keys should be human readable (e.g. Bounty Paper Towels)
    - Values with a discount code such as (-A) should be returned as negative price value
    
    ${JSON.stringify(parsedJson)}`;
    
    const secondResult = await model.generateContent([secondPrompt]);
    const cleanedJson = secondResult.response.text();
    
    // Parse and validate the cleaned JSON
    const sanitizedCleanedJson = sanitizeJSONResponse(cleanedJson);



    if (!sanitizedCleanedJson) {
      return NextResponse.json({ error: 'Failed to parse cleaned JSON.' }, { status: 500 });
    }
    const sanitizedCleanedNoTotalJson = removeItemsAfterTotal(sanitizedCleanedJson);

    console.log('Second prompt result (cleaned JSON):', sanitizedCleanedNoTotalJson);

    // Return the cleaned-up result
    return NextResponse.json({ cleanedJson: sanitizedCleanedNoTotalJson }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
