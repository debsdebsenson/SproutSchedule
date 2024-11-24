/** src/lib/utils/fileUtils.ts */

/**
 * Utility functions for handling file conversions and storage
 */

/**
 * Converts a File or Blob to a base64 dataURL
 * @param file - The File or Blob to convert
 * @returns Promise<string> - A promise that resolves with the dataURL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to dataURL'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
