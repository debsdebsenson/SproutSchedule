<!-- src/lib/components/CropModal.svelte -->

<!--  
A modal component that provides image cropping functionality using svelte-cropper.
It handles the UI for cropping images including controls, error states, and accessibility features.
-->

<script lang="ts">
    import { onMount } from 'svelte';
    import { Cropper, type CropperInstance, type CropperDefaultProps } from "svelte-cropper"
    
    // Component Props
    export let isOpen: boolean; // Controls the visibility of the modal
    export let imageUrl: string; // URL of the image to be cropped
    export let initialCropData: any = null; // Optional initial crop area data to restore a previous crop state
    export let onClose: () => void; // Callback function to handle the modal closure
    export let onCropComplete: (croppedImage: string, cropData: any) => Promise<boolean>; // Callback function that receives the cropped image and crop data, returns a boolean indicating success/failure of the crop proces
    
    // Component state
    let modalContainer: HTMLDivElement;
    let cropper: CropperInstance | null = null;
    let isCropping = false; // Tracks the cropping operation state
    let errorMessage = ''; // Stores error messages for display

    // Configuration for the svelte-cropper instance
    const cropper_props: CropperDefaultProps = {
        viewMode: 2,         // Restrict view to the container
        dragMode: "crop",    // Enable crop area creation by dragging
        initialAspectRatio: 1, // Set 1:1 aspect ratio
        data: initialCropData  // Apply initial crop area if provided
    }

    // Lifecycle management and initial setup
    onMount(() => {
        // Apply initial crop area after a brief delay to ensure cropper is ready
        if (cropper && initialCropData) {
            setTimeout(() => {
                cropper!.setData(initialCropData);
            }, 100);
        }
        
        // Cleanup function to destroy cropper instance
        return () => {
            if (cropper) {
                cropper.destroy();
            }
        };
    });
        
    // Event Handlers
        
    // Handle escape key press to close modal
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }

    // Handles the image cropping process
    async function handleCrop() {
        if (!cropper) return;
        
        isCropping = true;
        errorMessage = '';
        
        try {
            // Get the current crop area dimensions and position
            const cropData = cropper.getData();
            
            // Create a high-quality canvas of the cropped area
            const canvas = cropper.getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!canvas) {
                throw new Error('Failed to create crop canvas');
            }

            // Convert the canvas to a blob URL for the cropped image
            const croppedImage = await new Promise<string>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to create blob'));
                            return;
                        }
                        resolve(URL.createObjectURL(blob));
                    },
                    'image/jpeg',
                    0.95  // High quality JPEG compression
                );
            });

            // Pass the results to the parent component and handle success/failure
            const success = await onCropComplete(croppedImage, cropData);
            
            if (success) {
                onClose();
            } else {
                errorMessage = 'Failed to apply crop. Please try again.';
            }
        } catch (error) {
            console.error('Error cropping image:', error);
            errorMessage = 'An error occurred while cropping. Please try again.';
        } finally {
            isCropping = false;
        }
    }
        
    // Unified handler for closing the modal via click or keyboard
    function handleClose(event: MouseEvent | KeyboardEvent) {
        if (
            event.target === modalContainer && 
            (event.type === 'click' || 
            (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')))
        ) {
            onClose();
        }
    }

</script>
    
<!-- Error message display for user feedback -->
{#if errorMessage}
    <div class="error-message" role="alert">
        {errorMessage}
    </div>
{/if}

<!-- Global keyboard event listener for modal -->
<svelte:window on:keydown={handleKeydown}/>
    
<!-- Modal Structure -->
{#if isOpen}
    <div 
        class="modal-container" 
        bind:this={modalContainer}
        on:click={handleClose}
        on:keydown={handleClose}
        role="button"
        tabindex="0"
        aria-label="Close modal"
        >
        <div
            class="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            >
            <!-- Close button -->
            <button class="close-button" on:click={onClose} aria-label="Close modal">×</button>
            
            <!-- Modal title -->
            <h2 id="modal-title">Crop Image</h2>
            
            <!-- Cropper container -->
            <div class="image-container">
                <Cropper bind:cropper src={imageUrl} {cropper_props}/>
            </div>
            
            <!-- Action buttons -->
            <div class="button-container">
                <button class="cancel-button" on:click={onClose}>Cancel</button>
                <button 
                    class="save-button" 
                    on:click={handleCrop}
                    disabled={isCropping}
                    >
                    {isCropping ? 'Processing...' : 'Save Crop'}
                </button>
            </div>
        </div>
    </div>
{/if}
    
<style>
    /* Error message styling */
    .error-message {
        color: #dc2626;
        margin-top: 10px;
        text-align: center;
    }

    /* Modal overlay styling */
    .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    /* Modal content box styling */
    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    /* Close button styling */
    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .close-button:hover {
        background-color: #f0f0f0;
    }
    
    /* Modal title styling */
    h2 {
        margin: 0;
        padding-right: 30px;
    }
    
    /* Image cropper container styling */
    .image-container {
        flex-grow: 1;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f8f8;
        border-radius: 4px;
        overflow: hidden;
    }
    
    /* Ensure cropper fills container */
    :global(.image-container .cropper-container) {
        width: 100%;
        height: 100%;
    }
    
    /* Button container layout */
    .button-container {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    /* Common button styles */
    .cancel-button, .save-button {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        border: none;
        font-weight: 500;
    }
    
    /* Cancel button specific styles */
    .cancel-button {
        background-color: #f0f0f0;
    }
    
    /* Save button specific styles */
    .save-button {
        background-color: rgb(49, 80, 18);
        color: white;
    }
    
    /* Disabled save button state */
    .save-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
    
    /* Button hover states */
    .cancel-button:hover {
        background-color: #e0e0e0;
    }
    
    .save-button:hover:not(:disabled) {
        background-color: rgb(59, 90, 28);
    }
</style>
