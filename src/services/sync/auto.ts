
import { REMOTE_CONFIG } from '../config';
import { isSyncing } from '../dataStore';
import { syncAllData } from './index';
import { isSyncNeeded, getLastSyncTime } from './config';

// Setup automatic sync
export const setupAutoSync = (): (() => void) => {
  // If auto-sync is disabled, return empty cleanup function
  if (!REMOTE_CONFIG.ENABLED) {
    return () => {}; // Empty cleanup function
  }
  
  // Sync on initialization if needed
  if (isSyncNeeded()) {
    syncAllData().catch(console.error);
  }
  
  // Create periodic sync
  const intervalId = setInterval(() => {
    // Skip this cycle if sync is already in progress
    if (isSyncing) return;
    
    // Check if sync is needed (more than a certain time since last sync)
    const lastSyncStr = getLastSyncTime();
    if (lastSyncStr) {
      const lastSync = new Date(lastSyncStr);
      const syncInterval = REMOTE_CONFIG.CHECK_INTERVAL;
      const nextSyncTime = new Date(lastSync.getTime() + syncInterval);
      
      if (new Date() >= nextSyncTime) {
        syncAllData().catch(console.error);
      }
    } else {
      // If no previous sync, sync now
      syncAllData().catch(console.error);
    }
  }, Math.min(REMOTE_CONFIG.CHECK_INTERVAL, 3600000)); // Check at least every hour
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};
