<!-- src/lib/components/ClassificationResults.svelte -->

<!-- 
  This component displays the classification results for images, including:
  - Preview image
  - Common and scientific names
  - Basic information
  - Wikipedia links (when available)
  
  It handles various API response formats by checking multiple possible
  field names for each piece of information.
-->

<script lang="ts">
    export let results: Array<any>; // Array of classification results from the API, each result should contain image preview and classification data

    /**
     * Utility function to extract field values from result objects
     * Handles variations in API response field naming conventions
     * 
     * @param result - The classification result object
     * @param fieldNames - Array of possible field names to check
     * @returns The field value if found, null otherwise
     */
    function getFieldValue(result: any, fieldNames: string[]): string | null {
        // Get all keys from the result object
        const keys = Object.keys(result);
        
        // Find the first key that matches any of the provided field names
        // Normalize the key and field names by removing spaces and underscores
        const matchingKey = keys.find(key =>
            fieldNames.some(field => 
                key.toLowerCase().replace(/[_\s]/g, '') === field.toLowerCase()
            )
        );
        
        // Return the value if found and not 'None', otherwise return null
        return matchingKey && result[matchingKey] !== 'None' ? result[matchingKey] : null;
    }

    /**
     * Extract Wikipedia link from result object and handles variations
     */
    function getWikipediaLink(result: any): string | null {
        return getFieldValue(result, ['wikipedia', 'wikipedialink', 'link', 'wikipedia_link']);
    }

    /**
     * Extract common name from result object and handles variations
     */
    function getCommonName(result: any): string | null {
        return getFieldValue(result, ['commonname', 'common', 'common_name']);
    }

    /**
     * Extract scientific name from result object and handles variations
     */
    function getScientificName(result: any): string | null {
        return getFieldValue(result, ['scientificname', 'scientific', 'scientific_name']);
    }

    /**
     * Extract basic information from result object and handles variations
     */
    function getBasicInformation(result: any): string | null {
        return getFieldValue(result, ['basicinformation', 'information', 'info', 'basicinfo']);
    }
</script>

<!-- Main container for classification results -->
<div class="classification-results">
    <h2>Classification Results</h2>
    
    <!-- Iterate through each classification result -->
    {#each results as result}
        <div class="result-item">
            <!-- Image preview section -->
            <div>
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img 
                    src={result.preview} 
                    alt="Classified image" 
                    class="classified-image" 
                />
            </div>

            <!-- Classification details section -->
            <div class="result-details">
                <!-- Display common and scientific names, fallback to 'Unknown' if not available -->
                <h3>{getCommonName(result) || 'Unknown'} ({getScientificName(result) || 'Unknown'})</h3>
                
                <!-- Display basic information with fallback text -->
                <p>{getBasicInformation(result) || 'No basic information available'}</p>
                
                <!-- Conditionally render Wikipedia link if available -->
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
            </div>
        </div>
    {/each}
</div>

<style>
    /* Center-align the entire results container */
    .classification-results {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* Layout for individual result items */
    .result-item {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
    }

    /* Image sizing and spacing */
    .classified-image {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        margin-right: 20px;
    }

    /* Layout for result details */
    .result-details {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* Wikipedia link styling */
    .result-details a {
        color: #0645AD;
        text-decoration: none;
    }

    .result-details a:hover {
        text-decoration: underline;
    }
</style>
