
import { Channel, Country, Category } from '@/types';
import { API_BASE_URL, STORAGE_KEYS } from './config';
import { channels, countries, categories, isSyncing, setIsSyncing } from './dataStore';
import * as channelService from './channelService';
import * as categoryService from './categoryService';
import * as countryService from './countryService';

// Function to fetch data from the remote API
export const syncWithRemoteAPI = async (): Promise<boolean> => {
  if (isSyncing) return false;
  
  try {
    setIsSyncing(true);
    console.log('Syncing with remote API...');
    
    // Fetch channels, countries, and categories from your website API
    const [channelsRes, countriesRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/channels`).then(res => res.json()),
      fetch(`${API_BASE_URL}/countries`).then(res => res.json()),
      fetch(`${API_BASE_URL}/categories`).then(res => res.json())
    ]);
    
    // Update local data
    Object.assign(channels, channelsRes);
    Object.assign(countries, countriesRes);
    Object.assign(categories, categoriesRes);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Update last sync time
    const lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
    
    console.log('Sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with remote API:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// Function to manually trigger sync with remote
export const forceSync = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};

// Sync all data from the API
export const syncAllData = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};

// Get the last sync time
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// Check if sync is needed (no data or older than 24 hours)
export const isSyncNeeded = (): boolean => {
  const lastSync = getLastSyncTime();
  
  if (!lastSync) {
    return true;
  }
  
  // Check if channels exist
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  if (!hasChannels || !hasCategories || !hasCountries) {
    return true;
  }
  
  // Check if last sync was more than 24 hours ago
  const lastSyncTime = new Date(lastSync).getTime();
  const currentTime = new Date().getTime();
  const hoursSinceSync = (currentTime - lastSyncTime) / (1000 * 60 * 60);
  
  return hoursSinceSync > 24;
};

// Check if sync is currently in progress
export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

// Initialize sync on application startup (only if needed)
if (isSyncNeeded()) {
  syncWithRemoteAPI().catch(error => {
    console.error('Initial sync failed:', error);
  });
}

// Periodic sync (every 1 hour)
setInterval(() => {
  syncWithRemoteAPI().catch(error => {
    console.error('Periodic sync failed:', error);
  });
}, 60 * 60 * 1000);
