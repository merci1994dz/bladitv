
import { STORAGE_KEYS } from './config';
import { channels, countries, categories, setIsSyncing } from './dataStore';

// Function that simulates syncing but actually just uses local data
export const syncWithRemoteAPI = async (): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('Using local data only (no remote sync)');
    
    // Simply save current data to localStorage
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Update last sync time
    const lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
    
    console.log('Local data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving local data:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// Function to manually trigger sync with local data
export const forceSync = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};

// Sync all data locally
export const syncAllData = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};

// Get the last sync time
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// Check if sync is needed (no data in localStorage)
export const isSyncNeeded = (): boolean => {
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  return !hasChannels || !hasCategories || !hasCountries;
};

// This variable tracks if sync is currently in progress
let syncInProgress = false;

// Check if sync is currently in progress
export const isSyncInProgress = (): boolean => {
  return syncInProgress;
};

// Initialize sync on application startup (only if needed)
if (isSyncNeeded()) {
  syncWithRemoteAPI().catch(error => {
    console.error('Initial sync failed:', error);
  });
}
