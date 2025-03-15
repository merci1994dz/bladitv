
// Main export file for sync functionality
import { isSyncing, setIsSyncing } from '../dataStore';
import { syncAllData, performInitialSync } from './coreSync';
import { forceDataRefresh } from './forceRefresh';
import { 
  publishChannelsToAllUsers, 
  verifyUpdatesPropagation, 
  forceBroadcastToAllBrowsers 
} from './publishOperations';
import { isSyncInProgress } from './status';

// Export from remote.ts
export { 
  getRemoteConfig, 
  setRemoteConfig,
  syncWithRemoteSource 
} from './remote';

// Export from local.ts
export { 
  getLastSyncTime, 
  isSyncNeeded,
  syncWithLocalData,
  forceSync,
  obfuscateStreamUrls
} from './local';

// Export from auto.ts
export { setupAutoSync } from './auto';

// Export from settingsSync/index.ts
export {
  setupSettingsListener,
  broadcastSettingsUpdate,
  forceAppReloadForAllUsers
} from './settingsSync';

// Export the core sync functions
export {
  syncAllData,
  performInitialSync
};

// Export force refresh functions
export {
  forceDataRefresh
};

// Export publishing functions
export {
  publishChannelsToAllUsers,
  verifyUpdatesPropagation,
  forceBroadcastToAllBrowsers
};

// Export status functions
export {
  isSyncInProgress
};

// تنفيذ المزامنة الأولية عند تحميل الوحدة
performInitialSync().catch(console.error);
