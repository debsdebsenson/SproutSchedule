<!--  src/routes/FileUpload.svelte -->
  
<script lang="ts">
    import { onMount } from 'svelte';
    import DropZone from '$lib/components/DropZone.svelte';
    import ImagePreview from '$lib/components/ImagePreview.svelte';
    import ClassificationResults from '$lib/components/ClassificationResults.svelte';
    import DuplicatePrompt from '$lib/components/DuplicatePrompt.svelte';

    let files: any[] = [];
    let uploadStatus = '';
    let messageTimer: NodeJS.Timeout | undefined;
    let duplicateFile: File | null = null;
    let classificationResults: any[] = [];

    function isImageFile(file: File) {
        return file.type.startsWith('image/');
    }

    function isDuplicateFile(newFile: File) {
        return files.some(existingFile => 
            existingFile.file.name === newFile.name && 
            existingFile.file.size === newFile.size
        );
    }

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

    async function addFile(file: File) {
        files = [...files, {
            file: file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }];
    }

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
            } catch (error) {
                console.error('Upload failed:', error);
                results.push({ file: file.file.name, error: 'Upload failed' });
            }
        }
        setMessage('Upload and classification complete!');
        classificationResults = results;
        files = [];
    }

    function setMessage(message: string) {
        uploadStatus = message;
        if (messageTimer) clearTimeout(messageTimer);
        messageTimer = setTimeout(() => {
            uploadStatus = '';
        }, 3000);
    }

    function deleteFile(id: number) {
        const fileToDelete = files.find(f => f.id === id);
        if (fileToDelete) {
            URL.revokeObjectURL(fileToDelete.preview);
        }
        files = files.filter(f => f.id !== id);
    }

    function handleDuplicateConfirm() {
        if (duplicateFile) {
            addFile(duplicateFile);
            duplicateFile = null;
        }
    }

    onMount(() => {
        return () => {
            files.forEach(file => URL.revokeObjectURL(file.preview));
        };
    });
</script>

<div class="file-upload">
    <DropZone onFilesSelected={handleFiles} />
    
    {#if files.length > 0}
        <ImagePreview {files} onDelete={deleteFile} />
        <button on:click={uploadFiles}>Upload Images</button>
    {/if}

    {#if uploadStatus}
        <p class="status-message">{uploadStatus}</p>
    {/if}

    {#if classificationResults.length > 0}
        <ClassificationResults results={classificationResults} />
    {/if}
    
    {#if duplicateFile}
        <DuplicatePrompt 
            file={duplicateFile}
            onConfirm={handleDuplicateConfirm}
            onCancel={() => duplicateFile = null}
        />
    {/if}
</div>

<style>
    .file-upload {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }
    
    .status-message {
        margin-top: 10px;
        padding: 10px;
        background-color: rgba(251, 242, 210, 0.6);
        border-left: 6px solid rgb(49, 80, 18);
    }
</style>
