<!-- src/lib/components/ImagePreview.svelte -->

<script lang="ts">
    export let files: Array<{ id: number; preview: string; file: File }>;
    export let onDelete: (id: number) => void;
</script>

<div class="image-preview">
    {#each files as file (file.id)}
        <div class="preview-item">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src={file.preview} alt="Image preview" />
            <button class="delete-button" on:click={() => onDelete(file.id)}>×</button>
        </div>
    {/each}
</div>

<style>
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
</style>