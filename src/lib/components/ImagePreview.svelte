<!-- src/lib/components/ImagePreview.svelte -->

<!-- 
    This component displays image previews with crop and delete functionality.
    Features:
    - Displays multiple image previews in a vertical layout
    - Supports image deletion
    - Integrates with CropModal for image cropping
    - Maintains original image data while showing cropped versions
    - Handles crop area persistence for re-editing
-->

<script lang="ts">
    import CropModal from './CropModal.svelte';
    import { fileToDataUrl } from '$lib/utils/fileUtils';
    
    // Props interface for image files
    export let files: Array<{ 
        id: number;               // Unique identifier for each image
        preview: string;          // Current preview URL
        file: File;               // Original file object
        originalPreview?: string; // Stores original (uncropped) image URL
        cropData?: any;           // Stores crop area coordinates (for re-editing)
    }>;
    
    export let onDelete: (id: number) => void; // Callback function to handle image deletion
    
    // Modal state management
    let isModalOpen = false;
    let selectedImage: { id: number; url: string } | null = null;
    
    /**
     * Opens the crop modal for a specific image
     * Uses original image if available, otherwise uses current preview
     * @param id - Image identifier
     * @param imageUrl - Current preview URL
     */
    function openCropModal(id: number, imageUrl: string) {
        const file = files.find(f => f.id === id);
        // Prioritize original image for cropping to prevent quality loss
        const urlToUse = file?.originalPreview || imageUrl;
        selectedImage = { id, url: urlToUse };
        isModalOpen = true;
    }
    
    /**
     * Resets modal state when closing
     */
    function closeCropModal() {
        isModalOpen = false;
        selectedImage = null;
    }
    
    /**
     * Handles the completion of image cropping
     * Creates a new File object from the cropped image and updates the files array
     * 
     * @param croppedImageBlobUrl - URL of the cropped image blob
     * @param cropData - Coordinates and dimensions of the crop area
     * @returns Promise<boolean> indicating success/failure
     */
    async function handleCropComplete(croppedImageBlobUrl: string, cropData: any): Promise<boolean> {
        if (!selectedImage) return false;
        
        const fileIndex = files.findIndex(f => f.id === selectedImage!.id);
        if (fileIndex === -1) return false;
        
        try {
            // Convert cropped image URL to blob
            const response = await fetch(croppedImageBlobUrl);
            const blob = await response.blob();
            
            // Create new File object from blob
            const newFile = new File([blob], files[fileIndex].file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
            
            // Convert the cropped image to dataURL
            const dataUrl = await fileToDataUrl(newFile);
            
            // Store original preview as dataURL if not already stored
            const originalPreview = files[fileIndex].originalPreview || 
                await fileToDataUrl(files[fileIndex].file);

            // Update file entry with new cropped version while maintaining original
            files[fileIndex] = {
                id: files[fileIndex].id,
                preview: dataUrl,    // Display cropped version
                originalPreview: originalPreview,  // Keep original for re-cropping
                file: newFile,
                cropData: cropData           // Store crop area for re-editing
            };
            
            // Force Svelte to recognize the array update
            files = [...files];
            
            // Clean up the temporary blob URL
            URL.revokeObjectURL(croppedImageBlobUrl);
            
            return true;
        } catch (error) {
            console.error('Failed to process cropped image:', error);
            return false;
        } finally {
            closeCropModal();
        }
    }
</script>

<!-- Image Preview Display -->
<div class="image-preview">
    {#each files as file (file.id)}
        <div class="preview-row">
            <div class="preview-item">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img src={file.preview} alt="Image preview" />
                <!-- Delete button -->
                <button 
                    class="delete-button" 
                    on:click={() => onDelete(file.id)}
                    aria-label="Delete image"
                >×</button>
            </div>
            <!-- Crop button -->
            <button 
                class="crop-image-button"
                on:click={() => openCropModal(file.id, file.preview)}
            >
                Crop Image
            </button>
        </div>
    {/each}
</div>

<!-- Crop Modal -->
{#if isModalOpen && selectedImage}
    <CropModal 
        isOpen={isModalOpen} 
        imageUrl={selectedImage.url}
        initialCropData={files.find(f => f.id === selectedImage?.id)?.cropData}
        onClose={closeCropModal}
        onCropComplete={handleCropComplete}
    />
{/if}

<style>
    /* Container for all image previews */
    .image-preview {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 20px;
        width: 100%;
    }
    
    /* Row container for preview and crop button */
    .preview-row {
        display: flex;
        align-items: center;
        gap: 20px;
        width: 100%;
    }
    
    /* Container for image and delete button */
    .preview-item {
        position: relative;
        width: 200px;
        height: 150px;
    }
    
    /* Image sizing and styling */
    .preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }
    
    /* Delete button styling */
    .delete-button {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: rgba(255, 255, 255, 0.7);
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        z-index: 1;
    }
    
    /* Delete button hover effect */
    .delete-button:hover {
        background-color: rgba(255, 0, 0, 0.7);
        color: white;
    }
    
    /* Crop button styling */
    .crop-image-button {
        padding: 8px 16px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    /* Crop button hover effect */
    .crop-image-button:hover {
        background-color: #e0e0e0;
    }
</style>
