
import { Channel, Country, Category } from '@/types';
import { initialState } from './types';

// Memory cache state
export let channels: Channel[] = initialState.channels;
export let countries: Country[] = initialState.countries;
export let categories: Category[] = initialState.categories;
export let isSyncing: boolean = initialState.isSyncing;

// Function to update sync state
export const setIsSyncing = (value: boolean) => {
  isSyncing = value;
};
