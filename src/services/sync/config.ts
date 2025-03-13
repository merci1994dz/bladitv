
import { STORAGE_KEYS, REMOTE_CONFIG } from '../config';

// Helper function to check if sync is needed
export const isSyncNeeded = (): boolean => {
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  // Also check if last sync was more than a day ago
  const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  if (lastSyncStr) {
    const lastSync = new Date(lastSyncStr);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (lastSync < oneDayAgo) return true;
  }
  
  return !hasChannels || !hasCategories || !hasCountries;
};

// Helper function to get/set last sync time
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

export const updateLastSyncTime = (): string => {
  const lastSyncTime = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
  return lastSyncTime;
};
