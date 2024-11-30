<!-- src/lib/components/IdentifiedItemsList.svelte -->

<!--
 A component that:
 - Displays a grid of identified items with their details and preview images
 - Shows a message when no items are present
 - Allows removal of individual items
 - Provides links to Wikipedia for additional information
-->

<script lang="ts">
  import { identifiedItems } from '../stores/identifiedItems'; // Store containing the identified items data


  /**
   * Converts a timestamp to a localized date string
   * @param timestamp - Timestamp in milliseconds
   * @returns Formatted date string in the user's locale
   */
  function formatDate(timestamp: number): string {
      return new Date(timestamp).toLocaleString();
  }
  
  /**
   * Removes an item from the identified items store
   * @param id - Unique identifier of the item to remove
   */
  function handleRemove(id: string) {
      identifiedItems.removeItem(id);
  }
</script>
  
<!-- Main container for the identified items list -->
<div class="identified-items">
    <h2>Identified Items</h2>

    <!-- Conditional rendering based on items presence (shows empty state message when no items exist) -->
    {#if $identifiedItems.length === 0}
        <p class="empty-message">No items identified yet</p>
    {:else}
        <!-- Grid container for item cards -->
        <div class="items-grid">
            <!-- Iterates through each identified item and renders individual item cards with details -->
            {#each $identifiedItems as item}
                <div class="item-card">
                    <!-- Item preview image -->
                    <img src={item.preview} alt={item.commonName} class="item-preview" />

                    <!-- Container for item metadata and actions like: name, classification, location, and timestamp -->
                    <div class="item-details">
                        <h3>{item.commonName}</h3>
                        <p class="scientific-name">{item.scientificName}</p>
                        <p class="classification">Type: {item.initialClassification}</p>
                        
                        <!-- Optional location display -->
                        {#if item.location}
                            <p class="location">Location: {item.location}</p>
                        {/if}
                        
                        <p class="timestamp">Identified: {formatDate(item.timestamp)}</p>

                        <!-- Optional Wikipedia link -->
                        {#if item.wikipediaLink !== 'None'}
                            <a href={item.wikipediaLink} target="_blank" rel="noopener noreferrer">
                                Learn More
                            </a>
                        {/if}

                        <!-- Remove button with click handler -->
                        <button class="remove-btn" on:click={() => handleRemove(item.id)}>
                            Remove
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
  
<style>
  /** Main container styling */
  .identified-items {
      margin-top: 2rem;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
  }
  
  /** Grid layout configuration which maintains minimum column width of 300px */
  .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
  }
  
  /** Individual item card styling */
  .item-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /** Preview image styling with cover fitting for varied image sizes */
  .item-preview {
      width: 100%;
      height: 200px;
      object-fit: cover;
  }
  
  /** Item details container */
  .item-details {
      padding: 1rem;
  }
  
  /** Heading styles */
  h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
  }
  
  /** Scientific name styling */
  .scientific-name {
      font-style: italic;
      color: #666;
      margin: 0 0 0.5rem 0;
  }
  
  /** Metadata text styling */
  .classification, .location, .timestamp {
      font-size: 0.9rem;
      margin: 0.25rem 0;
  }
  
  /** Remove button styling */
  .remove-btn {
      margin-top: 0.5rem;
      padding: 0.25rem 0.5rem;
      background-color: #ff4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
  }
  
  .remove-btn:hover {
      background-color: #ff0000;
  }
  
  /** Empty state message styling */
  .empty-message {
      text-align: center;
      color: #666;
      font-style: italic;
  }
</style>