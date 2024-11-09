
<!-- src/lib/components/loading/variants/FlowerSpinner.svelte-->

<!--
  Flower Loading Spinner Component
  Responsibilities:
  - Provides a visual spinner to indicate loading or processing activity.
  - Animates six petals around a center circle to create a rotating flower effect.
  - Displays a customizable loading message below the spinner.
  - Cleans up interval-based animations when the component is removed to prevent memory leaks.
-->

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    export let message: string = "Analyzing your plant...";  // Message prop providing a default value
    
    // Local state variables
    let rotation = 0;  // Angle of rotation for animated spinner
    let interval: ReturnType<typeof setInterval>;  // Stores interval ID for rotation animation

    // Triggered when the component is added to the DOM
    onMount(() => {
        interval = setInterval(() => {
            rotation = (rotation + 1) % 360; // Ensures rotation resets at 360 degrees
        }, 20);
    });
    
    // Triggered when the component is removed from the DOM
    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<!-- Main container for the loading spinner component -->
<div class="loading-spinner">
    <div class="flower">
        <div class="center" />
        <!-- Renders six petals, each rotated by a fixed angle, animated with the rotation variable -->
        {#each [0, 60, 120, 180, 240, 300] as angle}
            <div 
                class="petal" 
                style="transform: rotate({angle + rotation}deg)"
            >
                <div class="petal-inner" />
            </div>
        {/each}
    </div>
    <!-- Message displayed beneath the spinner, changes dynamically based on `message` prop -->
    <p class="message">{message}</p>
</div>

<style>
    /* Styling for the main spinner container */
    .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        margin: 1rem 0;
    }

    /* Flower container settings */
    .flower {
        position: relative;
        width: 6rem;
        height: 6rem;
    }
    
    /* Center circle of the flower */
    .center {
        position: absolute;
        inset: 33.333%;
        background-color: #FBD34D;
        border-radius: 50%;
    }
    
    /* General petal styling */
    .petal {
        position: absolute;
        width: 1.5rem;
        height: 3rem;
        left: 50%;
        margin-left: -0.75rem;
        transform-origin: bottom;
        transition: transform 0.02s linear;
    }
    
    /* Inner section of each petal */
    .petal-inner {
        width: 100%;
        height: 100%;
        background-color: #F472B6;
        border-radius: 9999px;
        opacity: 0.8;
    }
    
    /* Styling for the message text */
    .message {
        margin-left: 1rem;
        font-size: 1.125rem;
        color: #4B5563;
    }
</style>