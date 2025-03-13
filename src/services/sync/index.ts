
import { REMOTE_CONFIG } from '../config';
import { isSyncing, setIsSyncing } from '../dataStore';
import { getRemoteConfig } from './remote';
import { syncWithRemoteSource } from './remote';
import { syncWithLocalData } from './local';
import { isSyncNeeded, getLastSyncTime } from './config';

// Main export of sync functions
export { 
  getLastSyncTime, 
  isSyncNeeded,
  syncWithLocalData as syncWithRemoteAPI, // For backward compatibility
  forceSync,
  obfuscateStreamUrls
} from './local';

export { 
  getRemoteConfig, 
  setRemoteConfig,
  syncWithRemoteSource 
} from './remote';

export { setupAutoSync } from './auto';

// Main sync function
export const syncAllData = async (): Promise<boolean> => {
  if (isSyncing) {
    console.log('المزامنة قيد التنفيذ بالفعل');
    return false;
  }
  
  try {
    setIsSyncing(true);
    
    // Check for remote config
    const remoteConfigStr = localStorage.getItem('tv_remote_config');
    if (REMOTE_CONFIG.ENABLED && remoteConfigStr) {
      try {
        const remoteConfig = JSON.parse(remoteConfigStr);
        if (remoteConfig && remoteConfig.url) {
          return await syncWithRemoteSource(remoteConfig.url);
        }
      } catch (error) {
        console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
      }
    }
    
    // If no remote source or sync failed, use local data
    return await syncWithLocalData();
  } finally {
    setIsSyncing(false);
  }
};

// Export sync status check function
export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

// Initialize sync on application startup (only if needed)
if (isSyncNeeded()) {
  syncAllData().catch(error => {
    console.error('Initial sync failed:', error);
  });
}
