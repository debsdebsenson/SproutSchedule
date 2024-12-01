<!-- src/lib/components/ManualItemEntry.svelte -->
 
<script lang="ts">
    import { identifiedItems } from '$lib/stores/identifiedItems';
    import type { IdentifiedItem } from '$lib/stores/identifiedItems';
    import { PlusCircle, X, Edit } from 'lucide-svelte';
    import fallbackImage from '$lib/images/placeholder.png';
    
    /** City context passed to the component, used as default location */
    export let city: string;
    
    /** Optional existing item for editing */
    export let existingItem: IdentifiedItem | null = null;
    
    /** Controls the visibility of the modal */
    let isModalOpen = false;
    
    /** Stores form data for a new item entry or editing an existing item */
    let formData: Partial<IdentifiedItem> = {
        commonName: '',
        scientificName: '',
        information: '',
        wikipediaLink: '',
        location: ''
    };
    
    /** Determines if the component is in edit mode */
    $: isEditMode = !!existingItem;
    
    /**
     * Opens the manual entry modal
     * Populates form with existing item data if in edit mode
     */
    function openModal() {
        if (existingItem) {
        // Populate form with existing item data when editing
        formData = {
            commonName: existingItem.commonName !== 'Unknown' ? existingItem.commonName: '',
            scientificName: existingItem.scientificName !== 'Unknown' ? existingItem.scientificName: '',
            information: existingItem.information !== 'No additional information' ? existingItem.information : '',
            wikipediaLink: existingItem.wikipediaLink !== 'None' ? existingItem.wikipediaLink : '',
            location: existingItem.location !== 'Unknown' ? existingItem.location: '',
            preview: existingItem.preview || ''
        };
    } else {
            // Reset form for new entry
            resetForm();
        }
        isModalOpen = true;
    }
    
    /**
     * Closes the modal and resets the form
     */
    function closeModal() {
        isModalOpen = false;
        resetForm();
    }
    
    /**
     * Resets form data to initial empty state
     */
    function resetForm() {
        formData = {
            commonName: '',
            scientificName: '',
            information: '',
            wikipediaLink: '',
            location: ''
        };
    }
    
    /**
     * Handles form submission
     * - Validates that at least some basic information is provided
     * - Uses city as default location if no location is specified
     * - Adds or updates the item in the identifiedItems store
     * - Closes the modal after successful submission
     */
    function handleSubmit() {
        // Validate at least some basic information is provided
        if (!formData.commonName && !formData.scientificName) {
            alert('Please provide at least a common name or scientific name.');
            return;
        }
    
        // Use city as default location if no location is provided
        const defaultLocation = formData.location || city;
    
        if (isEditMode && existingItem) {
            // Update existing item
            identifiedItems.update(items => 
                items.map(item => 
                    item.id === existingItem.id 
                        ? {
                            ...item,
                            commonName: formData.commonName || 'Unknown',
                            scientificName: formData.scientificName || 'Unknown',
                            information: formData.information || 'No additional information',
                            wikipediaLink: formData.wikipediaLink || 'None',
                            location: formData.location || 'Unknown',
                            preview: formData.preview || item.preview
                        }
                        : item
                )
            );
        } else {
            // Add new item
            identifiedItems.addItems([{
                ...formData,
                location: defaultLocation,
                file: formData.commonName || 'Manual Entry',
                preview: formData.preview || fallbackImage
            }]);
        }
    
        // Close modal and reset form
        closeModal();
    }
    
    /**
     * Handles file upload for preview image
     * Reads the uploaded file and sets it as the preview image
     * @param event - File input change event
     */
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
    <!-- Button changes based on mode: Add new or Edit existing -->
    {#if isEditMode}
        <button on:click={openModal} class="edit-btn">
            <Edit size={20} />
            Edit Item
        </button>
    {:else}
        <button on:click={openModal} class="add-manual-btn">
            <PlusCircle />
            Add Manual Entry
        </button>
    {/if}

    {#if isModalOpen}
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2>{isEditMode ? 'Edit Item' : 'Manually Add Item'}</h2>
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
                        placeholder="Optional: https://en.wikipedia.org/wiki/..."
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
                    <button type="submit" class="submit-btn">
                        {isEditMode ? 'Update Item' : 'Add Item'}
                    </button>
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

    .edit-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        background-color: rgb(249 115 22);
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .edit-btn:hover {
        background-color: rgb(234 88 12);
    }
</style>