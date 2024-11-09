<!-- src/lib/components/DuplicatePrompt.svelte -->

<!-- 
  A modal-like component that:
  - Displays when a user attempts to upload a file that already exists
  - Shows the duplicate file name
  - Provides clear actions for handling the duplicate
  - Maintains a consistent UI with the application's style
-->

<script lang="ts">
    // Props
    export let file: File; // The duplicate file that was attempted to be uploaded
    export let onConfirm: () => void; // A callback function executed when the user confirms adding the duplicate
    export let onCancel: () => void; // A callback function executed when the user declines adding the duplicate
</script>

<!-- 
  Main container for the duplicate file prompt
  Provides visual separation from the rest of the UI
-->
<div class="duplicate-prompt">
    <!-- 
        Informative message showing the duplicate file name
    -->
    <p>The file "{file.name}" has already been added. Do you want to add it again?</p>
    
    <!-- Action buttons -->
    <!-- 'Yes' button triggers onConfirm callback -->
    <button on:click={onConfirm}>Yes</button>
    
    <!-- 'No' button triggers onCancel callback -->
    <button on:click={onCancel}>No</button>
</div>

<style>
    /* 
     * Prompt container styling
     * - Provides visual distinction from the main UI
     * - Uses subtle background color and rounded corners
     * - Adds spacing for better visual hierarchy
     */
    .duplicate-prompt {
        margin-top: 20px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 4px;
    }

    /* 
     * Button styling
     * - Adds horizontal spacing between buttons
     * - Adds vertical spacing from the message
     */
    .duplicate-prompt button {
        margin-right: 10px;
        margin-top: 10px;
    }
</style>