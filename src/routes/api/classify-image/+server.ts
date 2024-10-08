/** +server.ts */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import sharp from 'sharp';

// Initialize OpenAI client using the API key from environment variables
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Resizes an image to fit within 512x512 dimensions if necessary.
 * @param imageBuffer - The buffer containing the image data.
 * @returns - A buffer containing the resized image or the original image if no resizing is needed.
 */
async function resizeImage(imageBuffer: Buffer): Promise<Buffer> {
  console.log(`Original image size: ${imageBuffer.length} bytes`);
  
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  
  if (!metadata.width || !metadata.height) {
    console.log('Unable to get image dimensions, using original image');
    return imageBuffer;
  }
  
  console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
  
  // Resize the image if its dimensions exceed 512x512, keeping the aspect ratio
  if (metadata.width > 512 || metadata.height > 512) {
    const resizedImage = await image
      .resize({
        width: 512,
        height: 512,
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true // Prevent enlarging if the image is smaller
      })
      .toBuffer();

    console.log(`Resized image size: ${resizedImage.length} bytes`);
    return resizedImage;
  } else {
    console.log('Image is smaller than or equal to 512x512, not resizing');
    return imageBuffer;
  }
}


/**
 * Classifies an image using OpenAI's API to determine if it's a plant, fungus, or something else.
 * @param base64Image - The base64-encoded string of the image.
 * @param mimeType - The MIME type of the image (e.g., 'image/png').
 * @returns - A response containing the classification result.
 */
async function classifyImage(base64Image: string, mimeType: string): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Does this image show a plant, a fungus, or something else? Please give a short answer: plant, fungus, else"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 300
  });

  return response.choices[0].message;
}

/**
 * Identifies the plant or fungus in the image by asking OpenAI for a detailed classification.
 * @param base64Image - The base64-encoded string of the image.
 * @param mimeType - The MIME type of the image (e.g., 'image/png').
 * @param type - The type of the object to identify, either 'plant' or 'fungus'.
 * @returns - A response containing the scientific name and common names of the object.
 */
async function identifyPlantOrFungus(base64Image: string, mimeType: string, type: 'plant' | 'fungus'): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `What ${type} is this? Please provide with this patter the following information as raw JSON object with the following fields: common name, scientific name, wikipedia link, basic information. If othere is no information about any of these categories add "None" please.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 300
  });

  return response.choices[0].message;
}

/**
 * Handles a POST request to classify an uploaded image.
 * It first resizes the image, classifies it, and then (if applicable) identifies the plant or fungus in more detail.
 * @param event - The RequestEvent object from SvelteKit.
 * @returns - A JSON response containing the classification and detailed classification (if available).
 */
export async function POST(event: RequestEvent) {
  // Parse the incoming form data and extract the image file
  const formData = await event.request.formData();
  const imageFile = formData.get('image') as File;

  if (!imageFile) {
    return json({ error: 'No image file provided' }, { status: 400 });
  }

  try {
    // Convert the image file to a buffer and resize it
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const resizedImageBuffer = await resizeImage(imageBuffer);
    
    // Convert both resized and original images to base64 strings
    const resizedBase64Image = resizedImageBuffer.toString('base64');
    const originalBase64Image = imageBuffer.toString('base64');
    
    // Classify the image to determine if it's a plant, fungus, or something else
    const initialClassification = await classifyImage(resizedBase64Image, imageFile.type);
    console.log('Initial classification:', initialClassification);

    let detailedClassification = null;
    const lowerCaseContent = initialClassification.content.toLowerCase();

    // If the image is classified as a plant or fungus, get more detailed information
    if (lowerCaseContent.includes('plant') || lowerCaseContent.includes('fungus')) {
      const type = lowerCaseContent.includes('plant') ? 'plant' : 'fungus';
      detailedClassification = await identifyPlantOrFungus(originalBase64Image, imageFile.type, type);
      console.log('Detailed classification:', detailedClassification);
    }

    // Return the classification results as a JSON response
    return json({
      initialClassification: initialClassification.content,
      detailedClassification: detailedClassification ? detailedClassification.content : null
    });
  } catch (error) {
    console.error('Error processing image or calling OpenAI API:', error);
    return json({ error: 'Failed to process image or classify it' }, { status: 500 });
  }
}