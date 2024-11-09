<!-- src/lib/Geodata.svelte -->

<!--
  A component for handling geolocation functionality:
  - Gets the user's location and resolves it to a city name
  - Provides a fallback for manually entering the location
-->

<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';

    export let city: string = 'Unknown';
    export let error: string | null = null;

    let showLocationPrompt: boolean = false; // Internal state
    const dispatch = createEventDispatcher();

    /**
     * Handles errors that occur when trying to get the user's geolocation.
     * Returns an error message based on the error code.
     * @param err - The GeolocationPositionError object
     * @returns - The error message
     */
    function handleGeolocationError(err: GeolocationPositionError) {
        switch (err.code) {
            case err.PERMISSION_DENIED:
                showLocationPrompt = true;
                return "Location access was denied. Please allow access or enter your location manually.";
            case err.POSITION_UNAVAILABLE:
                return "Location information is unavailable.";
            case err.TIMEOUT:
                return "The request to get user location timed out.";
            default:
                return "An unknown error occurred while requesting geolocation.";
        }
    }

    /**
     * Attempts to get the user's location using the browser's geolocation API.
     * If successful, it calls the processLocation function.
     * If an error occurs, it sets the error variable and emits an 'error' event.
     */
    async function getLocation() {
        if (browser && 'geolocation' in navigator) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 30000,
                        maximumAge: 0,
                        enableHighAccuracy: true
                    });
                });
                await processLocation(position.coords.latitude, position.coords.longitude);
            } catch (e) {
                if (e instanceof GeolocationPositionError) {
                    error = handleGeolocationError(e);
                } else if (e instanceof Error) {
                    error = e.message;
                } else {
                    error = String(e);
                }
                dispatch('error', { error });
            }
        } else {
            error = 'Geolocation is not supported by your browser';
            showLocationPrompt = true;
            dispatch('error', { error });
        }
    }

    /**
     * Processes the user's location by making a request to the OpenStreetMap API.
     * Updates the city variable with the resolved city name.
     * If the city name is 'Unknown', it sets the error variable and emits an 'error' event.
     * @param latitude - The user's latitude
     * @param longitude - The user's longitude
     */
    async function processLocation(latitude: number, longitude: number) {
        console.log("latitude:", latitude, "longitude: ", longitude);
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
        console.log("city:", city);
        if (city === 'Unknown') {
            error = "Couldn't determine city from the provided coordinates.";
            dispatch('error', { error });
        } else {
            dispatch('cityUpdated', { city });
        }
    }

    /**
     * Provides instructions to the user on how to enable location services in various browsers.
     * Attempts to request the location again after showing the instructions.
     */
    function openLocationSettings() {
        if (browser) {
            let message = '';
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf('firefox') > -1) {
                message = 'To enable location services in Firefox:\n1. Click the menu button and select Settings\n2. Select Privacy & Security panel\n3. Scroll to the Permissions section\n4. Click the Settings button next to Location\n5. Check "Allow" for this website';
            } else if (userAgent.indexOf('chrome') > -1) {
                message = 'To enable location services in Chrome:\n1. Click the lock icon in the address bar\n2. Select "Site settings"\n3. Find "Location" and change it to "Allow"';
            } else if (userAgent.indexOf('safari') > -1) {
                message = 'To enable location services in Safari:\n1. Open Safari preferences\n2. Go to the Privacy tab\n3. Under Website use of location services, select "Prompt for each website once each day" or "Allow"';
            } else if (userAgent.indexOf('edge') > -1) {
                message = 'To enable location services in Edge:\n1. Click the lock icon in the address bar\n2. Select "Site permissions"\n3. Find "Location" and change it to "Allow"';
            } else if (userAgent.indexOf('opera') > -1) {
                message = 'To enable location services in Opera:\n1. Click the shield icon in the address bar\n2. Find "Site settings"\n3. Locate "Location" and change it to "Allow"';
            } else {
                message = 'Please check your browser settings to enable location services for this website.';
            }

            alert(message);

            // Attempt to request location again after showing instructions
            getLocation();
        }
    }

    /**
     * Handles the user's manual location input.
     * Updates the city variable, hides the location prompt, and clears any existing error.
     * Emits a 'cityUpdated' event with the new city.
     * @param event - The change event from the input field
     */
    function handleManualLocationInput(event: Event) {
        const input = event.target as HTMLInputElement;
        city = input.value;
        showLocationPrompt = false;
        error = null;
        dispatch('cityUpdated', { city });
    }

    // Call the getLocation function when the component is mounted
    onMount(() => {
        getLocation();
    });
</script>

<!-- 
  Conditionally render the location prompt if showLocationPrompt is true.
  Displays the error message, a button to open location settings, and an input field for manual location entry.
-->
{#if showLocationPrompt}
    <div>
        <p>{error}</p>
        <button on:click={openLocationSettings}>How to Enable Location</button>
        <p>Or enter your location manually:</p>
        <input type="text" placeholder="Enter city or country" on:change={handleManualLocationInput}>
    </div>
{/if}