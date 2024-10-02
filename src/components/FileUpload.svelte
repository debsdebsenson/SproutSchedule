<!-- FileUpload.svelte -->

<script>
    import { onMount } from 'svelte';
    
    let fileInput;
    let dropZone;
    let files = [];
    let uploadStatus = '';
    let messageTimer;
    let elapsedMessageTime = 3000; // Clear messages after 3 seconds
    let timeout = 2000;
    let duplicateFile = null;

    // Helper function to check if a file is an image based on its type
    function isImageFile(file) {
        return file.type.startsWith('image/');
    }
    
    // Helper function to check if a file is already in the list (prevents duplicates)
    function isDuplicateFile(newFile) {
        return files.some(existingFile => 
            existingFile.file.name === newFile.name && 
            existingFile.file.size === newFile.size
        );
    }
    
    // Function to handle file selection from both input and drop events
    function handleFiles(eventFiles) {
        const imageFiles = Array.from(eventFiles).filter(isImageFile);  // Filter out non-image files
        
        for (let file of imageFiles) {
            // Check for duplicate files before adding
            if (isDuplicateFile(file)) {
                duplicateFile = file;
                return; // Stop processing and wait for user input to confirm duplicate
            }
            
            addFile(file);  // Add non-duplicate files to the list
        }
    
        if (eventFiles.length !== imageFiles.length) {
            setMessage('Sorry, some files were not images. Only images were added.');
        }
    }
    
    // Function to add a file to the list with a preview and a unique ID
    function addFile(file) {
        files = [...files, {
            file,
            preview: URL.createObjectURL(file),  // Create a URL for previewing the image
            id: Date.now() + Math.random()  // Generate a unique ID for each file
        }];
    }
    
    // Event handler to allow files to be dropped in the drop zone
    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';  // Set drop effect to indicate copying files
    }
    
    // Event handler for when files are dropped into the drop zone
    function handleDrop(event) {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);  // Process the dropped files
    }
    
    // Event handler for when files are selected via the input element
    function handleChange(event) {
        handleFiles(event.target.files);  // Process the selected files
    }
    
    // TBD: Improve this simulated file upload function
    async function uploadFiles() {
        setMessage('Uploading...');  // Show uploading message
        await new Promise(resolve => setTimeout(resolve, timeout));  // Simulate delay
        // TBD: Send the files to a server or store them in the local browser storage
        setMessage('Upload successful!');  // Show success message
        // Clean up object URLs to free up memory
        files.forEach(file => URL.revokeObjectURL(file.preview));
        files = [];  // Clear the files array after upload
    }
    
    // Function to set a status message and clear it after a delay
    function setMessage(message) {
        uploadStatus = message;
        if (messageTimer) clearTimeout(messageTimer);  // Clear existing timer
        messageTimer = setTimeout(() => {
            uploadStatus = '';  // Clear the message after the delay
        }, elapsedMessageTime);
    }
    
    // Function to trigger file input dialog (used for keyboard accessibility)
    function openFilePicker() {
        fileInput.click();
    }
    
    // Keyboard accessibility: allow file picker to open with Enter or Space keys
    function handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
        }
    }
    
    // Function to delete a selected file by ID
    function deleteFile(id) {
        const fileToDelete = files.find(f => f.id === id);  // Find the file to delete
        if (fileToDelete) {
            URL.revokeObjectURL(fileToDelete.preview);  // Revoke the object URL to free memory
        }
        files = files.filter(f => f.id !== id);  // Remove the file from the list
    }
    
    // Confirm adding a duplicate file
    function handleDuplicateConfirm() {
        if (duplicateFile) {
            addFile(duplicateFile);
            duplicateFile = null;
        }
    }
    
    // Cancel adding a duplicate file
    function handleDuplicateCancel() {
        duplicateFile = null;
    }
    
    // Svelte lifecycle function: runs when the component is mounted
    onMount(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);  // Detect mobile devices
        if (!isMobile) {
            dropZone.addEventListener('dragover', handleDragOver);  // Add dragover event on non-mobile devices
            dropZone.addEventListener('drop', handleDrop);  // Add drop event on non-mobile devices
        }
        return () => {
            // Clean up: revoke object URLs when the component is destroyed
            files.forEach(file => URL.revokeObjectURL(file.preview));
        };
    });
</script>

<div class="file-upload">
    <!-- Drop zone for drag-and-drop file uploads -->
    <div
        bind:this={dropZone}
        class="drop-zone"
        on:click={openFilePicker}
        on:keydown={handleKeydown}
        role="button"
        tabindex="0"
    >
        <p>
            {#if /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
                Tap here to select images from your device
            {:else}
                Drag & drop image files here or click to select
            {/if}
        </p>
        <!-- Hidden file input element for file selection via click or keyboard -->
        <input
            bind:this={fileInput}
            type="file"
            on:change={handleChange}
            multiple
            accept="image/*"
        />
    </div>
    
    <!-- Image preview section -->
    {#if files.length > 0}
        <div class="image-preview">
            {#each files as file (file.id)}
                <div class="preview-item">
                    <!-- Preview the image with a delete button -->
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <img src={file.preview} alt="Image preview" />
                    <button class="delete-button" on:click={() => deleteFile(file.id)}>×</button>
                </div>
            {/each}
        </div>
        <!-- Upload button -->
        <button on:click={uploadFiles}>Upload Images</button>
    {/if}
    
    <!-- Display upload status messages -->
    {#if uploadStatus}
        <p class="status-message">{uploadStatus}</p>
    {/if}
    
    <!-- Duplicate file confirmation prompt -->
    {#if duplicateFile}
        <div class="duplicate-prompt">
            <p>The file "{duplicateFile.name}" has already been added. Do you want to add it again?</p>
            <button on:click={handleDuplicateConfirm}>Yes</button>
            <button on:click={handleDuplicateCancel}>No</button>
        </div>
    {/if}
</div>

<style>
</style>