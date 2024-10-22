<!-- src/lib/components/ClassificationResults.svelte -->
 
<script lang="ts">
    export let results: Array<any>;

    function getFieldValue(result: any, fieldNames: string[]): string | null {
        const keys = Object.keys(result);
        const matchingKey = keys.find(key => 
            fieldNames.some(field => key.toLowerCase().replace(/[_\s]/g, '') === field.toLowerCase())
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
</script>

<div class="classification-results">
    <h2>Classification Results</h2>
    {#each results as result}
        <div class="result-item">
            <div>
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img src={result.preview} alt="Classified image" class="classified-image" />
            </div>
            <div class="result-details">
                <h3>{getCommonName(result) || 'Unknown'} ({getScientificName(result) || 'Unknown'})</h3>
                <p>{getBasicInformation(result) || 'No basic information available'}</p>
                {#if getWikipediaLink(result)}
                    <p>
                        More information available on 
                        <a href={getWikipediaLink(result)} target="_blank" rel="noopener noreferrer">
                            Wikipedia
                        </a>
                    </p>
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
    }

    .result-item {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
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
    }

    .result-details a {
        color: #0645AD;
        text-decoration: none;
    }

    .result-details a:hover {
        text-decoration: underline;
    }
</style>
