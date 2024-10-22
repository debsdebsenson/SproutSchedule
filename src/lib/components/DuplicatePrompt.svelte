<!-- src/lib/components/DuplicatePrompt.svelte -->
 
<script lang="ts">
    export let file: File;
    export let onConfirm: () => void;
    export let onCancel: () => void;
</script>

<div class="duplicate-prompt">
    <p>The file "{file.name}" has already been added. Do you want to add it again?</p>
    <button on:click={onConfirm}>Yes</button>
    <button on:click={onCancel}>No</button>
</div>

<style>
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