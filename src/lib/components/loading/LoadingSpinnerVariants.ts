/**  src/lib/components/loading/LoadingSpinnerVariants.ts */

/**
 * Core module for managing loading spinner animations and messages.
 * Provides a collection of spinner variants and associated loading messages
 * that can be randomly selected by RandomSpinner.svelte.
 * 
 * Responsibilities:
 * - Defines and manages available spinner animation variants
 * - Provides utility functions for random spinner and message selection
 * - Maintains consistent loading message content
 */

import type { ComponentType } from 'svelte';
import FlowerSpinner from './variants/FlowerSpinner.svelte';
import FlowerSpinner2 from './variants/FlowerSpinner2.svelte';
// Other spinner variants to be added here

/**
 * Interface defining the structure of a spinner variant.
 * Each variant consists of a unique identifier and its corresponding Svelte component.
 */
export interface SpinnerVariant {
    id: string;                 // Unique identifier for the spinner variant
    component: ComponentType;   // The actual Svelte component implementing the spinner
}

/**
 * Collection of available spinner variants.
 * Each entry defines a unique spinner animation that can be displayed during loading states.
 * 
 * @note When adding new variants, ensure the component is imported above and added to this array
 */
export const spinnerVariants: SpinnerVariant[] = [
    { id: 'flower', component: FlowerSpinner },
    { id: 'flower2', component: FlowerSpinner2 },
    // Other spinner variants to be added here
    // { id: 'watering', component: WateringSpinner },
];

/**
 * Selects a random spinner variant from the available options.
 * 
 * @returns {SpinnerVariant} A randomly selected spinner variant
 */
export function getRandomSpinner(): SpinnerVariant {
    const randomIndex = Math.floor(Math.random() * spinnerVariants.length);
    return spinnerVariants[randomIndex];
}

/**
 * Predefined loading messages that correspond to different stages of the plant identification process.
 * 
 * @const {Object} SPINNER_MESSAGES
 * @property {string} ANALYZING - Message shown during initial image analysis
 * @property {string} IDENTIFYING - Message shown during species identification
 */
export const SPINNER_MESSAGES = {
    ANALYZING: "Analyzing your plant...",
    IDENTIFYING: "Identifying species...",
    // Other spinner message variants to be added here
} as const;

/**
 * Selects a random loading message from the predefined set of messages.
 * Provides variety in loading feedback to maintain user engagement.
 * 
 * @returns {string} A randomly selected loading message
 */
export function getRandomMessage(): string {
    const messages = Object.values(SPINNER_MESSAGES);
    return messages[Math.floor(Math.random() * messages.length)];
}