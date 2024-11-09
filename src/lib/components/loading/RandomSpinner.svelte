<!--  src/lib/components/loading/RandomSpinner.svelte-->

<!--
  Dynamic loading spinner component that randomly selects and displays a spinner variant.
  
  Responsibilities:
  - Dynamically loads and displays a random spinner animation on mount
  - Pairs the spinner with a loading message
  - Manages the lifecycle of the selected spinner component
-->

<script lang="ts">
    import { onMount } from 'svelte';
    import type { SpinnerVariant } from './LoadingSpinnerVariants';
    import { getRandomSpinner, getRandomMessage } from './LoadingSpinnerVariants';

    let SelectedSpinner: SpinnerVariant['component']; // Component reference for the dynamically selected spinner variant.
    let message: string; // Current loading message

    /**
     * Lifecycle hook that initializes the component on mount.
     * Randomly selects both a spinner variant and accompanying message.
     */
    onMount(() => {
        const spinner = getRandomSpinner();
        SelectedSpinner = spinner.component;
        message = getRandomMessage();
    });
</script>

<!-- Dynamic component renderer section which only renders when a spinner has been successfully selected. -->
{#if SelectedSpinner}
    <svelte:component this={SelectedSpinner} {message} />
{/if}