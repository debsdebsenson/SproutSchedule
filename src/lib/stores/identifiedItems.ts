/** src/lib/stores/identifiedItems.ts */

/**
 * A storage module that provides functionality for adding, removing,
 * and persisting items to localStorage.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Interface representing an identified item's data structure
 * @interface IdentifiedItem
 */
export interface IdentifiedItem {
    /** Unique identifier for the item */
    id: string;
    /** File eference */
    file: string;
    /** Path to item preview image */
    preview: string;
    /** Initial classification category */
    initialClassification: string;
    /** Common name of the item */
    commonName: string;
    /** Scientific name of the item */
    scientificName: string;
    /** Additional descriptive information */
    information: string;
    /** URL to Wikipedia article or 'None' if not available */
    wikipediaLink: string;
    /** Timestamp of when the item was identified */
    timestamp: number;
    /** Geographic location where the item was found */
    location: string;
}

/**
 * Creates and returns a custom Svelte storage for managing identified items.
 * The store includes persistence to localStorage and custom methods for
 * adding, removing, and clearing items.
 *
 * @returns {Object} A custom storage object with subscribe method and additional functionality
 */
function createIdentifiedItemsStore() {
    // Initialize store with data from localStorage if in browser environment
    const initialItems: IdentifiedItem[] = browser
        ? (() => {
            try {
                const storedData = localStorage.getItem('identifiedItems');
                if (!storedData) return [];
                
                const parsedData = JSON.parse(storedData);
                
                // Map the data with correct property names
                return parsedData.map((item: any) => ({
                    id: item.id || crypto.randomUUID(),
                    file: item.file || '',
                    preview: item.preview || '',
                    initialClassification: item.initialClassification || 'Unknown',
                    commonName: item['commonName'] || item.commonName || 'None', // Handle both formats
                    scientificName: item['scientificName'] || item.scientificName || 'None', // Handle both formats
                    information: item.information || 'None',
                    wikipediaLink: item.wikipediaLink || 'None',
                    timestamp: item.timestamp || Date.now(),
                    location: item.location || ''
                }));
            } catch (error) {
                console.error('Error loading identified items from localStorage:', error);
                return [];
            }
        })()
        : [];

    const { subscribe, set, update } = writable<IdentifiedItem[]>(initialItems);

    const store = {
        subscribe,

        addItems: (newItems: Partial<IdentifiedItem>[]) => {
            update(items => {
                const itemsToAdd = newItems.map(item => ({
                    id: crypto.randomUUID(),
                    file: item.file || '',
                    preview: item.preview || 'welcome_fallback',
                    initialClassification: item.initialClassification || 'Manual',
                    commonName: item.commonName || 'Unknown',
                    scientificName: item.scientificName || 'Unknown',
                    information: item.information || 'No additional information',
                    wikipediaLink: item.wikipediaLink || 'None',
                    timestamp: Date.now(),
                    location: item.location || ''
                }));

                const updatedItems = [...itemsToAdd, ...items];

                if (browser) {
                    try {
                        localStorage.setItem('identifiedItems', JSON.stringify(updatedItems));
                    } catch (error) {
                        console.error('Error saving to localStorage:', error);
                    }
                }

                return updatedItems;
            });
        },

        removeItem: (id: string) => {
            update(items => {
                const updatedItems = items.filter(item => item.id !== id);

                if (browser) {
                    try {
                        localStorage.setItem('identifiedItems', JSON.stringify(updatedItems));
                    } catch (error) {
                        console.error('Error saving to localStorage:', error);
                    }
                }

                return updatedItems;
            });
        },

        clearAll: () => {
            set([]);

            if (browser) {
                try {
                    localStorage.removeItem('identifiedItems');
                } catch (error) {
                    console.error('Error clearing localStorage:', error);
                }
            }
        }
    };

    return store;
}

/**
 * Example of how to interact with the identified items state throughout the
 * application.
 *
 * @example
 * // Subscribe to store changes
 * identifiedItems.subscribe(items => console.log(items));
 *
 * // Add new items
 * identifiedItems.addItems([{
 *   file: 'path/to/file',
 *   preview: 'path/to/preview',
 *   initialClassification: 'Plant',
 *   commonName: 'Dandelion',
 *   scientificName: 'Taraxacum officinale',
 *   information: 'Common flowering plant',
 *   wikipediaLink: 'https://wikipedia.org/wiki/Taraxacum',
 *   location: 'Berlin'
 * }]);
 *
 * // Remove an item
 * identifiedItems.removeItem('item-id');
 *
 * // Clear all items
 * identifiedItems.clearAll();
 */
export const identifiedItems = createIdentifiedItemsStore();