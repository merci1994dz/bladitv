
// Main export file for sync functionality
import { isSyncing, setIsSyncing } from '../dataStore';
import { syncAllData, performInitialSync } from './core';
import { forceDataRefresh } from './forceRefresh';
import { 
  publishChannelsToAllUsers, 
  verifyUpdatesPropagation, 
  forceBroadcastToAllBrowsers 
} from './publishOperations';
import { isSyncInProgress, setSyncActive, checkConnectivityIssues, getSyncStatus } from './status';

// Export from remote.ts
export { 
  getRemoteConfig, 
  setRemoteConfig,
} from './remote';

// Export from remoteSync.ts
export { 
  syncWithBladiInfo,
  syncWithRemoteSource
} from './remoteSync';

// Export checkBladiInfoAvailability function
export { checkBladiInfoAvailability } from './remote/syncOperations';

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

// Export from sync.ts (new simplified API)
export {
  syncChannels,
  forceUpdateChannels,
  useSyncHelper
} from './sync';

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
  isSyncInProgress,
  setSyncActive,
  checkConnectivityIssues,
  getSyncStatus
};

// تنفيذ المزامنة الأولية عند تحميل الوحدة - استخدام الوظيفة من المسار الجديد
import { performInitialSync as initialSync } from './core';
initialSync().catch(console.error);
