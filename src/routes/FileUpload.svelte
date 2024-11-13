<!--  src/routes/FileUpload.svelte -->

<!-- 
  Main component for handling file uploads and image classification.
  Responsibilities:
  - Manages the file upload process, including drag-and-drop and manual selection.
  - Displays previews of the uploaded images.
  - Sends the uploaded images to the server for classification.
  - Displays the classification results for each image.
  - Handles duplicate file uploads and prompts the user for confirmation.
-->

<script lang="ts">
    import { onMount } from 'svelte';
    import DropZone from '$lib/components/DropZone.svelte';
    import ImagePreview from '$lib/components/ImagePreview.svelte';
    import ClassificationResults from '$lib/components/ClassificationResults.svelte';
    import DuplicatePrompt from '$lib/components/DuplicatePrompt.svelte';
    import RandomLoadingSpinner from '$lib/components/loading/RandomSpinner.svelte';

    // TBD: Remove for production!
    // Imports for the API call mock
    import { dev } from '$app/environment';
    import { POST as mockPost } from '$lib/mock/mockClassificationApi';

    // State variables
    let files: any[] = []; // Array to store uploaded files
    let uploadStatus = ''; // Current status message of the upload process
    let messageTimer: NodeJS.Timeout | undefined; // Timer for clearing status messages
    let duplicateFile: File | null = null; // Stores duplicate file for confirmation
    let classificationResults: any[] = []; // Stores results from image classification
    let isLoading = false; // Loading state for the loading spinner

    /**
     * Checks if a file is an image by examining its MIME type.
     * @param file - File to check
     * @returns boolean indicating if file is an image
     */
    function isImageFile(file: File) {
        return file.type.startsWith('image/');
    }

    /**
     * Checks if a file already exists in the files array.
     * Compares filename and size to determine duplicates.
     * @param newFile - File to check for duplicates
     * @returns boolean indicating if file is a duplicate
     */
    function isDuplicateFile(newFile: File) {
        return files.some(existingFile => 
            existingFile.file.name === newFile.name && 
            existingFile.file.size === newFile.size
        );
    }

    /**
     * Handles file selection from drop zone or file input.
     * Filters for image files and checks for duplicates.
     * @param eventFiles - FileList from input or drop event
     */
    function handleFiles(eventFiles: FileList) {
        const imageFiles = Array.from(eventFiles).filter(isImageFile);
        for (let file of imageFiles) {
            if (isDuplicateFile(file)) {
                duplicateFile = file;
                return;
            }
            addFile(file);
        }
        if (eventFiles.length !== imageFiles.length) {
            setMessage('Sorry, some files were not images. Only images were added.');
        }
    }

    /**
     * Adds a new file to the files array.
     * Creates an object URL for preview.
     * @param file - File to add
     */
    async function addFile(file: File) {
        files = [...files, {
            file: file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }];
    }


    /**
     * TBD: Remove for production!
     * MOCK for the upload of files for classification.
     * Randomly returns either a "plant", "fungus", or "else" response with
     * delays to simulate network latency. It matches the structure of the
     * real API responses and includes error handling similar to the real API.
     */
    async function uploadFiles() {
        isLoading = true;
        setMessage('Uploading...');
        let results: any[] = [];
        
        try {
            for (let file of files) {
                const formData = new FormData();
                formData.append('image', file.file);
                
                // Use mock API in development, real API in production
                const response = dev 
                    ? await mockPost(formData)
                    : await fetch('/api/classify-image', {
                        method: 'POST',
                        body: formData
                    });
                    
                const result = await response.json();
                
                let parsedDetails = { commonName: 'None', scientificName: 'None', information: 'None', wikipediaLink: 'None' };
                if (result.detailedClassification) {
                    const json = result.detailedClassification
                        .replace("```json\n", "")
                        .replace("```", "");
                    parsedDetails = JSON.parse(json);
                }
                results.push({
                    file: file.file.name,
                    preview: file.preview,
                    initialClassification: result.initialClassification,
                    ...parsedDetails
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            isLoading = false;
            setMessage('Upload and classification complete!');
            classificationResults = results;
            files = [];
        }
    }

    /**
     * Uploads files for classification.
     * Sends each file to the API and processes the results.
     */
     /*
     async function uploadFiles() {
        isLoading = true;
        setMessage('Uploading...');
        let results = [];
        
        try {
            for (let file of files) {
                const formData = new FormData();
                formData.append('image', file.file);
                const response = await fetch('/api/classify-image', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                let parsedDetails = { commonName: 'None', scientificName: 'None', information: 'None', wikipediaLink: 'None' };
                if (result.detailedClassification) {
                    const json = result.detailedClassification
                        .replace("```json\n", "")
                        .replace("```", "");
                    parsedDetails = JSON.parse(json);
                }
                results.push({
                    file: file.file.name,
                    preview: file.preview,
                    initialClassification: result.initialClassification,
                    ...parsedDetails
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            isLoading = false;
            setMessage('Upload and classification complete!');
            classificationResults = results;
            files = [];
        }
    }
    */

    /**
     * Sets a temporary status message.
     * Clears the message after 3 seconds.
     * @param message - Status message to display
     */
    function setMessage(message: string) {
        uploadStatus = message;
        if (messageTimer) clearTimeout(messageTimer);
        messageTimer = setTimeout(() => {
            uploadStatus = '';
        }, 3000);
    }

    /**
     * Deletes a file from the files array.
     * Revokes the object URL to prevent memory leaks.
     * @param id - ID of file to delete
     */
    function deleteFile(id: number) {
        const fileToDelete = files.find(f => f.id === id);
        if (fileToDelete) {
            URL.revokeObjectURL(fileToDelete.preview);
        }
        files = files.filter(f => f.id !== id);
    }

    /**
     * Handles confirmation of duplicate file upload.
     * Adds the duplicate file if confirmed.
     */
    function handleDuplicateConfirm() {
        if (duplicateFile) {
            addFile(duplicateFile);
            duplicateFile = null;
        }
    }

    /**
     * Cleanup function on component unmount.
     * Revokes all object URLs to prevent memory leaks.
     */
    onMount(() => {
        return () => {
            files.forEach(file => URL.revokeObjectURL(file.preview));
        };
    });
</script>

<!-- Main container for the file upload functionality -->
<div class="file-upload">
    <!-- DropZone component for drag-and-drop file input -->
    <DropZone onFilesSelected={handleFiles} />
    
    <!-- Conditionally render the ImagePreview and Upload button if files exist -->
    {#if files.length > 0}
        <ImagePreview {files} onDelete={deleteFile} />
        <button on:click={uploadFiles}>Upload Images</button>
    {/if}

    <!-- Conditionally render the status message if it's set -->
    {#if uploadStatus}
        <p class="status-message">{uploadStatus}</p>
    {/if}

    <!-- Conditionally render the ClassificationResults if there are any results -->
    {#if classificationResults.length > 0}
        <ClassificationResults results={classificationResults} />
    {/if}
    
    <!-- Conditionally render the DuplicatePrompt if a duplicate file is detected -->
    {#if duplicateFile}
        <DuplicatePrompt 
            file={duplicateFile}
            onConfirm={handleDuplicateConfirm}
            onCancel={() => duplicateFile = null}
        />
    {/if}

    <!-- Conditionally render the RandomLoadingSpinner if an image upload process is in progress -->
    {#if isLoading}
        <RandomLoadingSpinner />
    {/if}
</div>

<style>
    /* Styles for the main container */
    .file-upload {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }
    
    /* Styles for the status message */
    .status-message {
        margin-top: 10px;
        padding: 10px;
        background-color: rgba(251, 242, 210, 0.6);
        border-left: 6px solid rgb(49, 80, 18);
    }
</style>