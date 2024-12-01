<!-- src/lib/components/ManualItemEntry.svelte -->

<script lang="ts">
    import { identifiedItems } from '$lib/stores/identifiedItems';
    import type { IdentifiedItem } from '$lib/stores/identifiedItems';
    import { PlusCircle, X } from 'lucide-svelte';
    import fallbackImage from '$lib/images/placeholder.png';
    
    export let city : string;
    
    let isModalOpen = false;
    let formData: Partial<IdentifiedItem> = {
        commonName: '',
        scientificName: '',
        information: '',
        wikipediaLink: '',
        location: ''
    };
    
    function openModal() {
        isModalOpen = true;
    }
    
    function closeModal() {
        isModalOpen = false;
        resetForm();
    }
    
    function resetForm() {
        formData = {
        commonName: '',
        scientificName: '',
        information: '',
        wikipediaLink: '',
        location: ''
        };
    }
    
    function handleSubmit() {
        // Validate at least some basic information is provided
        if (!formData.commonName && !formData.scientificName) {
            alert('Please provide at least a common name or scientific name.');
            return;
        }

        // Use city as default location if no location is provided
        const defaultLocation = formData.location || city;
        
        // Add the item to the store
        identifiedItems.addItems([{
            ...formData,
            location: defaultLocation,
            file: formData.commonName || 'Manual Entry',
            preview: fallbackImage
        }]);
        
        // Close modal and reset form
        closeModal();
    }
    
    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                formData.preview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
    </script>
    
    <div class="manual-entry">
        <button on:click={openModal} class="add-manual-btn">
            <PlusCircle />
            Add Manual Entry
        </button>
    
        {#if isModalOpen}
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Manually Add Item</h2>
                        <button on:click={closeModal} class="close-btn">
                            <X />
                        </button>
                    </div>
                
                    <form on:submit|preventDefault={handleSubmit}>
                        <div class="form-group">
                            <label for="preview">Preview Image (Optional)</label>
                            <input 
                                type="file" 
                                id="preview" 
                                accept="image/*"
                                on:change={handleFileUpload}
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="commonName">Common Name</label>
                            <input 
                                type="text" 
                                id="commonName" 
                                bind:value={formData.commonName}
                                placeholder="e.g., Dandelion"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="scientificName">Scientific Name</label>
                            <input 
                                type="text" 
                                id="scientificName" 
                                bind:value={formData.scientificName}
                                placeholder="e.g., Taraxacum officinale"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="information">Additional Information</label>
                            <textarea 
                                id="information" 
                                bind:value={formData.information}
                                placeholder="Describe the item, its characteristics, habitat, etc."
                            ></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="wikipediaLink">Wikipedia Link (Optional)</label>
                            <input 
                                type="url" 
                                id="wikipediaLink" 
                                bind:value={formData.wikipediaLink}
                                placeholder="https://en.wikipedia.org/wiki..."
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="location">Location</label>
                            <input 
                                type="text" 
                                id="location" 
                                bind:value={formData.location}
                                placeholder="Where was this item found?"
                            />
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="submit-btn">Add Item</button>
                            <button type="button" class="cancel-btn" on:click={closeModal}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        {/if}
    </div>
    
    <style>
        .manual-entry {
        position: relative;
    }
    
    .add-manual-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: rgb(37 99 235);
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .add-manual-btn:hover {
        background-color: rgb(29 78 216);
    }
    
    .modal-backdrop {
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
    
    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .close-btn {
        background: none;
        border: none;
        cursor: pointer;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid rgb(209 213 219);
        border-radius: 0.375rem;
    }
    
    .form-group textarea {
        min-height: 100px;
        resize: vertical;
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .submit-btn,
    .cancel-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        font-weight: 500;
        cursor: pointer;
    }
    
    .submit-btn {
        background-color: rgb(37 99 235);
        color: white;
    }
    
    .submit-btn:hover {
        background-color: rgb(29 78 216);
    }
    
    .cancel-btn {
        background-color: rgb(229 231 235);
        color: rgb(17 24 39);
    }
    
    .cancel-btn:hover {
        background-color: rgb(209 213 219);
    }
</style>