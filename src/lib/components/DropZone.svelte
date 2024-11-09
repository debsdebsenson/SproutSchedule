<!-- src/lib/components/DropZone.svelte -->

<!-- 
  This is a file upload component that provides:
  - Drag and drop file upload functionality for desktop
  - Click/tap to upload for all devices
  - Mobile-specific UI adaptation
  - Keyboard accessibility
  - Image file type filtering
-->

<script lang="ts">
    import { onMount } from 'svelte';

    export let onFilesSelected: (files: FileList) => void; // Callback function to handle selected files, invoked when files are selected either via drag-drop or file picker

    // References to DOM elements
    let fileInput: HTMLInputElement;  // Hidden file input element
    let dropZone: HTMLDivElement;     // Drop zone container

    /**
     * Handles the dragover event
     * Sets the drop effect to 'copy' to indicate file copy operation
     */
    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
    }

    /**
     * Handles file drop events
     * Extracts files from the drop event and passes them to the handler
     */
    function handleDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer?.files) {
            onFilesSelected(event.dataTransfer.files);
        }
    }

    /**
     * Handles file selection via file input
     * Triggered when files are selected through the file picker
     */
    function handleChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            onFilesSelected(target.files);
        }
    }

    /**
     * Opens the native file picker dialog
     * Triggered by click/tap on drop zone or keyboard interaction
     */
    function openFilePicker() {
        fileInput.click();
    }

    /**
     * Handles keyboard interaction for accessibility
     * Opens the file picker on Enter or Space key press
     */
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
        }
    }

    /**
     * Component lifecycle management
     * - Detects mobile devices
     * - Sets up drag-and-drop event listeners for desktop
     * - Provides cleanup on component destruction
     */
    onMount(() => {
        // Check if current device is mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isMobile && dropZone) {
            // Add drag and drop event listeners for desktop devices
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('drop', handleDrop);
            
            // Prevent default drag behaviors to ensure smooth operation
            dropZone.addEventListener('dragenter', (e) => e.preventDefault());
            dropZone.addEventListener('dragleave', (e) => e.preventDefault());
        }

        // Cleanup function to remove event listeners when component is destroyed
        return () => {
            if (!isMobile && dropZone) {
                dropZone.removeEventListener('dragover', handleDragOver);
                dropZone.removeEventListener('drop', handleDrop);
                dropZone.removeEventListener('dragenter', (e) => e.preventDefault());
                dropZone.removeEventListener('dragleave', (e) => e.preventDefault());
            }
        };
    });
</script>

<!-- 
  Drop zone container
  - Acts as a button (for accessibility)
  - Handles keyboard interactions
  - Provides visual feedback for interaction
-->
<div
    bind:this={dropZone}
    class="drop-zone"
    on:click={openFilePicker}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
    >
    <!-- Adaptive messaging based on device type -->
    <p>
        {#if /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
            Tap here to select images from your device
        {:else}
            Drag & drop image files here or click to select
        {/if}
    </p>

    <!-- 
        Hidden file input element
        - Handles actual file selection
        - Filtered to accept only image files
        - Allows multiple file selection
    -->
    <input
        bind:this={fileInput}
        type="file"
        on:change={handleChange}
        multiple
        accept="image/*"
    />
</div>

<style>
    /* 
     * Drop zone styling
     * - Provides visual cues for interaction
     * - Uses dashed border to indicate drop area
     * - Includes hover/focus states for better UX
     */
    .drop-zone {
        border: 2px dashed rgb(49, 80, 18);
        border-radius: 4px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    /* Visual feedback for interaction */
    .drop-zone:hover, .drop-zone:focus {
        background-color: #62431850;
        outline: none;
    }

    /* Hide the native file input */
    input[type="file"] {
        display: none;
    }
</style>