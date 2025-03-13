
import { Channel, Country, Category } from '@/types';
import { STORAGE_KEYS } from './config';
import { fallbackChannels, fallbackCountries, fallbackCategories } from './fallbackData';

// In-memory cache
export let channels: Channel[] = [];
export let countries: Country[] = [];
export let categories: Category[] = [];
export let isSyncing = false;

// Helper to load data from localStorage or use fallbacks
export const loadFromLocalStorage = () => {
  try {
    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    if (storedChannels) {
      channels = JSON.parse(storedChannels);
    } else {
      channels = [...fallbackChannels];
    }

    if (storedCountries) {
      countries = JSON.parse(storedCountries);
    } else {
      countries = [...fallbackCountries];
    }

    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    } else {
      categories = [...fallbackCategories];
    }
    
    // Initialize admin password if not exists
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, 'admin123');
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    
    // Use fallback data
    channels = [...fallbackChannels];
    countries = [...fallbackCountries];
    categories = [...fallbackCategories];
  }
};

// Initialize data
loadFromLocalStorage();
