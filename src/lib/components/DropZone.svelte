<!-- src/lib/components/DropZone.svelte -->

<script lang="ts">
    import { onMount } from 'svelte';
    export let onFilesSelected: (files: FileList) => void;
    
    let fileInput: HTMLInputElement;
    let dropZone: HTMLDivElement;
    
    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
    }
    
    function handleDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer?.files) {
            onFilesSelected(event.dataTransfer.files);
        }
    }
    
    function handleChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            onFilesSelected(target.files);
        }
    }
    
    function openFilePicker() {
        fileInput.click();
    }
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
        }
    }

    onMount(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (!isMobile && dropZone) {
            // Add drag and drop event listeners
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('drop', handleDrop);
            
            // Prevent default drag behaviors on the drop zone
            dropZone.addEventListener('dragenter', (e) => e.preventDefault());
            dropZone.addEventListener('dragleave', (e) => e.preventDefault());
        }

        // Cleanup function
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
    <input
        bind:this={fileInput}
        type="file"
        on:change={handleChange}
        multiple
        accept="image/*"
    />
</div>

<style>
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
</style>