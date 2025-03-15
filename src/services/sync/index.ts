
import { REMOTE_CONFIG } from '../config';
import { isSyncing, setIsSyncing, saveChannelsToStorage } from '../dataStore';
import { getRemoteConfig, setRemoteConfig, syncWithRemoteSource } from './remote';
import { syncWithLocalData, getLastSyncTime, isSyncNeeded, forceSync, obfuscateStreamUrls, syncWithRemoteAPI } from './local';
import { setupAutoSync } from './auto';

// Main export of sync functions
export { 
  getLastSyncTime, 
  isSyncNeeded,
  syncWithRemoteAPI,
  forceSync,
  obfuscateStreamUrls
} from './local';

export { 
  getRemoteConfig, 
  setRemoteConfig,
  syncWithRemoteSource 
} from './remote';

export { setupAutoSync } from './auto';

// Main sync function - Improved with better caching control and guaranteed refresh
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  if (isSyncing) {
    console.log('المزامنة قيد التنفيذ بالفعل');
    return false;
  }
  
  try {
    setIsSyncing(true);
    
    // Add cache-busting parameter to avoid browser caching
    const cacheBuster = `?_=${Date.now()}`;
    
    // Check for remote config
    const remoteConfigStr = localStorage.getItem('tv_remote_config');
    if (REMOTE_CONFIG.ENABLED && remoteConfigStr) {
      try {
        const remoteConfig = JSON.parse(remoteConfigStr);
        if (remoteConfig && remoteConfig.url) {
          // Add cache-busting to the URL
          const urlWithCacheBuster = remoteConfig.url.includes('?') 
            ? `${remoteConfig.url}&_=${Date.now()}` 
            : `${remoteConfig.url}${cacheBuster}`;
            
          return await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        }
      } catch (error) {
        console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
      }
    }
    
    // If no remote source or sync failed, use local data
    return await syncWithLocalData(forceRefresh);
  } finally {
    setIsSyncing(false);
  }
};

// Force refresh function - enhanced to ensure all data is refreshed
export const forceDataRefresh = async (): Promise<boolean> => {
  // Clear channel data from localStorage to force a refresh
  localStorage.removeItem('last_sync_time');
  localStorage.removeItem('last_sync');
  
  // Trigger a save of current channels to ensure they're included in local storage
  saveChannelsToStorage();
  
  // Force the refresh
  const success = await syncAllData(true);
  
  // Force page reload to show new data
  if (success) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  
  return success;
};

// Export sync status check function
export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

// Add function to check and perform initial sync on application startup
export const performInitialSync = (): void => {
  if (isSyncNeeded()) {
    syncAllData().catch(error => {
      console.error('Initial sync failed:', error);
    });
  }
};

// Ensure channels are visible to all users - new function
export const publishChannelsToAllUsers = async (): Promise<boolean> => {
  // Save channels to make sure they're visible to all
  saveChannelsToStorage();
  
  // Force sync to make sure changes are propagated
  return await forceDataRefresh();
};

// Initialize sync on application startup (only if needed)
performInitialSync();
