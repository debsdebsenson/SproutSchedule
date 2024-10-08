<!-- FileUpload.svelte -->

<script lang="ts">
    import { onMount } from 'svelte';
    
    let fileInput: HTMLInputElement;
    let dropZone: HTMLDivElement;
    let files: any[] = [];
    let uploadStatus = '';
    let messageTimer: string | number | NodeJS.Timeout | undefined;
    let elapsedMessageTime = 3000;
    let timeout = 2000;
    let duplicateFile: any;
    let classificationResults: any[] = []; // Store classification results

    // Helper function to check if a file is an image based on its type
    function isImageFile(file: { type: string; }) {
        return file.type.startsWith('image/');
    }
    
    // Helper function to check if a file is already in the list (prevents duplicates)
    function isDuplicateFile(newFile: any) {
        return files.some(existingFile => 
            existingFile.file.name === newFile.name && 
            existingFile.file.size === newFile.size
        );
    }
    
    // Function to handle file selection from both input and drop events
    function handleFiles(eventFiles: any[] | ArrayLike<unknown>) {
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
    async function addFile(file: File) {
        files = [...files, {
            file: file,
            preview: URL.createObjectURL(file), // Create a URL for previewing the image
            id: Date.now() + Math.random() // Generate a unique ID for each file
        }];
    }
    
    // Event handler to allow files to be dropped in the drop zone
    function handleDragOver(event: any) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';  // Set drop effect to indicate copying files
    }
    
    // Event handler for when files are dropped into the drop zone
    function handleDrop(event: any) {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);  // Process the dropped files
    }
    
    // Event handler for when files are selected via the input element
    function handleChange(event:any) {
        handleFiles(event.target.files);  // Process the selected files
    }

    // Image uploading
    async function uploadFiles() {
        setMessage('Uploading...');
        let results = [];
        for (let file of files) {
            try {
                const formData = new FormData();
                formData.append('image', file.file);
                
                const response = await fetch('/api/classify-image', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                console.log(result);
                
                // Parse the detailed classification
                let parsedDetails = { commonName: 'None', scientificName: 'None', information: 'None', wikipediaLink: 'None' };
                if (result.detailedClassification) {
                    var json = result.detailedClassification.replace("```json\n", "");
                    json = json.replace("```", "");

                    console.log(json);

                    const parsedResponseObject = JSON.parse(json);
                    console.log(parsedResponseObject);

                    parsedDetails = parsedResponseObject;
                }
                
                results.push({
                    file: file.file.name,
                    preview: file.preview,
                    initialClassification: result.initialClassification,
                    ...parsedDetails
                });
            } catch (error) {
                console.error('Upload failed:', error);
                results.push({ file: file.file.name, error: 'Upload failed' });
            }
        }
        setMessage('Upload and classification complete!');
        console.log('All results:', results);
        classificationResults = results; // Update the state with classification results
        console.log("classificationResults: ", classificationResults);
        files = []; // Clear the files array after upload
    }


    // Image preparation
    function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to read file as Data URL'));
                }
            };
            reader.onerror = error => reject(error);
        });
    }
    
    // Function to set a status message and clear it after a delay
    function setMessage(message: string) {
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
    function handleKeydown(event: { key: string; preventDefault: () => void; }) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
        }
    }
    
    // Function to delete a selected file by ID
    function deleteFile(id: any) {
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

    // Helper functions to get various fields
    function getFieldValue(result: any, fieldNames: string[]): string | null {
        const keys = Object.keys(result);
        const matchingKey = keys.find(key => 
            fieldNames.some(field => key.toLowerCase().replace(/[_\s]/g, '') === field.toLowerCase())
        );
        
        return matchingKey && result[matchingKey] !== 'None' ? result[matchingKey] : null;
    }

    function getWikipediaLink(result: any): string | null {
        return getFieldValue(result, ['wikipedia', 'wikipedialink', 'link', 'wikipedia_link', 'wikipedia link', 'wikipedia-link']);
    }

    function getCommonName(result: any): string | null {
        return getFieldValue(result, ['commonname', 'common', 'common_name', 'common name', 'common-name']);
    }

    function getScientificName(result: any): string | null {
        return getFieldValue(result, ['scientificname', 'scientific', 'scientific_name', 'scientific name', 'scientific-name']);
    }

    function getBasicInformation(result: any): string | null {
        return getFieldValue(result, ['basicinformation', 'information', 'info', 'basicinfo', 'basic', 'basic_information', 'basic information', 'basic-information']);
    }
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

    <!-- Display classification results -->
    {#if classificationResults.length > 0}
        <div class="classification-results">
            <h2>Classification Results</h2>
            {#each classificationResults as result}
                <div class="result-item">
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <div>
                        <img src={result.preview} alt="Classified image" class="classified-image" />
                    </div>
                    <div class="result-details">
                        <h3>{getCommonName(result) || 'Unknown'} ({getScientificName(result) || 'Unknown'})</h3>
                        <p>{getBasicInformation(result) || 'No basic information available'}</p>
                        {#if getWikipediaLink(result)}
                            <p>
                                More information available on 
                                <a href={getWikipediaLink(result)} target="_blank" rel="noopener noreferrer">Wikipedia</a>.
                            </p>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
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
    .result-details a {
        color: #0645AD;
        text-decoration: none;
    }

    .result-details a:hover {
        text-decoration: underline;
    }

    .file-upload {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }

    .classification-results {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .result-item {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
    }

    .classified-image {
        max-width: 100%; /* Makes sure the image doesn't exceed the width of its container */
        max-height: 200px; /* Adjust this value as needed to control the max height */
        object-fit: contain; /* Ensures the image scales proportionally */
        margin-right: 20px;
    }

    .result-details {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

.drop-zone {
	border: 2px dashed rgb(49, 80, 18);
	border-radius: 4px;
	padding: 20px;
	text-align: center;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.drop-zone:hover, .drop-zone:focus {
    background-color: #62431850;
    outline: none;
}

input[type="file"] {
	display: none;
}
  
.status-message {
    margin-top: 10px;
    padding: 10px;
    background-color: rgba(251, 242, 210, 0.6);
    border-left: 6px solid rgb(49, 80, 18);
}

.image-preview {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 20px;
}

.preview-item {
	width: calc(33.333% - 10px);
	text-align: center;
	position: relative;
}

.preview-item img {
	max-width: 100%;
	height: auto;
	border-radius: 4px;
}

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
}

.delete-button:hover {
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
}

.duplicate-prompt {
    margin-top: 20px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
}

.duplicate-prompt button {
    margin-right: 10px;
    margin-top: 10px;
}
</style>