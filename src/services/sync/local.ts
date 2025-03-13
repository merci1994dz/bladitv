
import { STORAGE_KEYS, SECURITY_CONFIG, VIDEO_PLAYER } from '../config';
import { channels, countries, categories, setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';

// Data obfuscation function for security
export function obfuscateStreamUrls(data: any[]): any[] {
  if (!VIDEO_PLAYER.OBFUSCATE_SOURCE) return data;
  
  return data.map(item => {
    if (item.streamUrl) {
      // Create a deep copy to avoid modifying the original object
      const secureItem = {...item};
      
      // Store original URL in memory but create a protected reference for display
      const originalUrl = secureItem.streamUrl;
      
      // Replace with a protected placeholder for display purposes
      Object.defineProperty(secureItem, '_secureStreamUrl', {
        value: originalUrl,
        enumerable: false,
        writable: false,
        configurable: false
      });
      
      // Replace the publicly visible URL with a secure proxy or placeholder
      secureItem.streamUrl = VIDEO_PLAYER.USE_PROXY 
        ? `proxy://${btoa(originalUrl).substring(0, 10)}...`
        : `protected://${btoa(originalUrl.split('/')[2] || 'stream').substring(0, 8)}`;
      
      return secureItem;
    }
    return item;
  });
}

// Function that works with local data
export const syncWithLocalData = async (): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('Using local data only (no remote sync)');
    
    // Simply save current data to localStorage
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Update last sync time
    updateLastSyncTime();
    
    console.log('Local data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving local data:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// Helper function to get last sync time - added to fix export error
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// Helper function to check if sync is needed - added to fix export error
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

// Alias for backward compatibility
export const forceSync = syncWithLocalData;
export const syncWithRemoteAPI = syncWithLocalData; // For backward compatibility
