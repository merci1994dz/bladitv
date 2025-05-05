
/**
 * Main export file for sync status functionality
 */

// Export sync status checking functions
export {
  isSyncInProgress,
  setSyncActive,
  getSyncStatus
} from './syncState';

// Export sync error management functions
export {
  setSyncError,
  clearSyncError,
  getSyncError,
  checkConnectionFromError
} from './errorHandling';

// Export timestamp management functions
export {
  setSyncTimestamp,
  getLastSyncTime
} from './timestamp';

// Export connectivity checking functions directly from their source
export {
  checkConnectivityIssues,
  checkServerConnection,
  testEndpointAvailability,
  isConnected
} from './connectivity';

// Re-export all - removed to prevent circular dependencies
// Do not re-export all modules as this can cause circular dependency issues
