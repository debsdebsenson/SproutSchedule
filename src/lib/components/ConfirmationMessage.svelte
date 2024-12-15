<!-- src/lib/components/ConfirmationMessage.svelte -->
<script lang="ts">
    import { CheckCircle } from 'lucide-svelte';
    import { onDestroy } from 'svelte';

    /** The message to display */
    export let message: string = '';

    /** Duration to show the message (in milliseconds) */
    export let duration: number = 3000;

    /** Callback function when message is cleared */
    export let onClear: (() => void) | null = null;

    let timer: NodeJS.Timeout;

    // Automatically clear the message after specified duration
    $: if (message) {
        // Clear any existing timer
        if (timer) {
            clearTimeout(timer);
        }

        // Set a new timer to clear the message
        timer = setTimeout(() => {
            message = '';
            if (onClear) {
                onClear();
            }
        }, duration);
    }

    // Ensure timer is cleared if component is destroyed
    onDestroy(() => {
        if (timer) {
            clearTimeout(timer);
        }
    });
</script>

{#if message}
    <div class="confirmation-message">
        <CheckCircle color="green" size={24} />
        {message}
    </div>
{/if}

<style>
    .confirmation-message {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border: 1px solid #4CAF50;
        color: #4CAF50;
        padding: 10px 20px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1100;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translate(-50%, 100%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
</style>