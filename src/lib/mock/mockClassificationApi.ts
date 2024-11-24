/** src/lib/mock/mockClassificationApi.ts  */

/**
 * Mock API implementation for image classification during development.
 * 
 * Features:
 * - Provides consistent mock responses for plants, fungi, and other objects
 * - Matches the real API's interface for seamless production switching
 * - Includes error handling similar to the production API
 * - Simulates network delays for realistic testing
 */

/**
 * Represents the structure of a classification response from the API.
 */
interface ClassificationResponse {
    /** Initial classification result: "Plant", "Fungus", or "else" */
    initialClassification: string;
    /** Detailed classification in JSON string format, or null if not applicable */
    detailedClassification: string | null;
}

/**
 * Pre-defined mock responses for different types of classifications.
 * Each response includes both initial and detailed classifications.
 */
const mockResponses: Record<string, ClassificationResponse> = {
    plant: {
        initialClassification: "Plant",
        detailedClassification: JSON.stringify({
            "commonName": "Garden Rose",
            "scientificName": "Rosa × damascena",
            "wikipediaLink": "https://en.wikipedia.org/wiki/Rosa_×_damascena",
            "basicInformation": "The Damask rose is a hybrid rose species, derived from Rosa gallica and Rosa moschata. It is known for its fine fragrance and is commonly used in perfumes and rose water production."
        }, null, 2)
    },
    fungus: {
        initialClassification: "Fungus",
        detailedClassification: JSON.stringify({
            "commonName": "Fly Agaric",
            "scientificName": "Amanita muscaria",
            "wikipediaLink": "https://en.wikipedia.org/wiki/Amanita_muscaria",
            "basicInformation": "The Fly Agaric is a toxic mushroom known for its iconic red cap with white spots. It is found in various parts of the world and is often depicted in fairy-tale art."
        }, null, 2)
    },
    other: {
        initialClassification: "else",
        detailedClassification: null
    }
};

/**
 * Simulates network latency by introducing a random delay.
 * 
 * @param min - Minimum delay in milliseconds (default: 500ms)
 * @param max - Maximum delay in milliseconds (default: 2000ms)
 * @returns Promise that resolves after the random delay
 */
const simulateDelay = (min: number = 100, max: number = 200): Promise<void> => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock implementation of image classification API
 * @param imageFile - The file to be "classified"
 * @returns Promise resolving to a ClassificationResponse
 */
export async function mockClassifyImage(imageFile: File): Promise<ClassificationResponse> {
    // Simulate network delay
    await simulateDelay();
    
    // Randomly select a response type based on file size
    const responseTypes = ['plant', 'fungus', 'other'];
    const randomIndex = Math.floor(Math.random() * responseTypes.length);
    const responseType = responseTypes[randomIndex];
    
    return mockResponses[responseType];
}

/**
 * Mock implementation of the classification API endpoint.
 * Matches the real API's interface.
 
 * Usage:
 * ```typescript
 * const formData = new FormData();
 * formData.append('image', imageFile);
 * const response = await POST(formData);
 * const result = await response.json();
 * ```
 * 
 * @param formData - FormData object containing the image file
 * @returns Promise resolving to a Response object
 * @throws Returns a 500 Response if processing fails
 */
export async function POST(formData: FormData) {
    try {
        const imageFile = formData.get('image') as File;
        
        if (!imageFile) {
            throw new Error('No image file provided');
        }
        
        const result = await mockClassifyImage(imageFile);
        
        return new Response(JSON.stringify(result), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Failed to process image or classify it' }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}