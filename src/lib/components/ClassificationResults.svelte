<!-- src/lib/components/ClassificationResults.svelte -->

<!-- 
  This component displays the classification results for images, including:
  - Preview image
  - Common and scientific names
  - Basic information with Wikipedia links (when available)
  - Provides an alternative display when no classification data is found:
    - Alerts the user that the classification was unsuccessful.
    - Offers tips for improving classification results.
    - Includes a "Try Again" button to reattempt classification.
  
  It handles various API response formats by checking multiple possible
  field names for each piece of information.
-->

<script lang="ts">
    import { CircleAlert, Camera, RefreshCw } from 'lucide-svelte';

    export let results: Array<any>;
    export let onTryAgain: () => void;

    /**
     * Utility function to extract field values from result objects
     * Handles variations in API response field naming conventions
     */
    function getFieldValue(result: any, fieldNames: string[]): string | null {
        const keys = Object.keys(result);
        const matchingKey = keys.find(key =>
            fieldNames.some(field => 
                key.toLowerCase().replace(/[_\s]/g, '') === field.toLowerCase()
            )
        );
        return matchingKey && result[matchingKey] !== 'None' ? result[matchingKey] : null;
    }

    function getWikipediaLink(result: any): string | null {
        return getFieldValue(result, ['wikipedia', 'wikipedialink', 'link', 'wikipedia_link']);
    }

    function getCommonName(result: any): string | null {
        return getFieldValue(result, ['commonname', 'common', 'common_name']);
    }

    function getScientificName(result: any): string | null {
        return getFieldValue(result, ['scientificname', 'scientific', 'scientific_name']);
    }

    function getBasicInformation(result: any): string | null {
        return getFieldValue(result, ['basicinformation', 'information', 'info', 'basicinfo']);
    }

    /**
     * Checks if a result has any meaningful classification data
     */
    function hasClassificationData(result: any): boolean {
        return !!(getCommonName(result) || 
                 getScientificName(result) || 
                 getBasicInformation(result) || 
                 getWikipediaLink(result));
    }
</script>

<div class="classification-results">
    <h2>Classification Results</h2>
    
    {#each results as result}
        <div class="result-item">
            <div>
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img 
                    src={result.preview} 
                    alt="Classified image" 
                    class="classified-image" 
                />
            </div>

            <div class="result-details">
                {#if hasClassificationData(result)}
                    <!-- Regular result display -->
                    <h3>{getCommonName(result)} ({getScientificName(result)})</h3>
                    <p>{getBasicInformation(result)}</p>
                    {#if getWikipediaLink(result)}
                        <p>
                            More information available on
                            <a 
                                href={getWikipediaLink(result)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                Wikipedia
                            </a>
                        </p>
                    {/if}
                {:else}
                    <!-- Empty state display -->
                    <div class="empty-state">
                        <div class="alert">
                            <CircleAlert color="#ff3e98" />
                            <div>
                                <h4>Sorry! We couldn't classify the image with confidence</h4>
                            </div>
                        </div>

                        <div class="help-card">
                            <Camera color="#ff3e98" />

                            <div class="tips">
                                <h3>Tips for better results:</h3>
                                <ul>
                                    <li>• Ensure the subject is well-lit and in focus</li>
                                    <li>• Try capturing the subject from different angles</li>
                                    <li>• Include the whole subject in the frame</li>
                                    <li>• Avoid blurry or dark images</li>
                                </ul>
                            </div>

                            <button class="retry-button" on:click={onTryAgain}>
                                <RefreshCw color="#ff3e98" />
                                Try Another Photo
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</div>

<style>
    .classification-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .result-item {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
        width: 100%;
    }

    .classified-image {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        margin-right: 20px;
    }

    .result-details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
    }

    .result-details a {
        color: #0645AD;
        text-decoration: none;
    }

    .result-details a:hover {
        text-decoration: underline;
    }

    /* Empty state styles */
    .empty-state {
        width: 100%;
    }

    .alert {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background-color: rgb(254 243 199 / 0.5);
        border: 1px solid rgb(251 191 36);
        border-radius: 0.375rem;
        margin-bottom: 1rem;
    }

    .help-card {
        background: white;
        border: 1px solid rgb(229 231 235);
        border-radius: 0.5rem;
        padding: 1.5rem;
        text-align: center;
    }

    .tips {
        margin: 1rem 0;
        text-align: left;
    }

    .tips h3 {
        color: rgb(17 24 39);
        font-size: 1.125rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }

    .tips ul {
        color: rgb(107 114 128);
        font-size: 0.875rem;
        list-style: none;
        padding: 0;
    }

    .tips li {
        margin: 0.25rem 0;
    }

    .retry-button {
        display: inline-flex;
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

    .retry-button:hover {
        background-color: rgb(29 78 216);
    }

    .alert h4 {
        color: rgb(146 64 14);
        font-size: 0.875rem;
        font-weight: 500;
        margin: 0;
    }
</style>