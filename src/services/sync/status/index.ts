
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
  getSyncError
} from './errorHandling';

// Export timestamp management functions
export {
  setSyncTimestamp,
  getLastSyncTime
} from './timestamp';

// Export connectivity checking functions
export {
  checkConnectivityIssues
} from './connectivity';

// Re-export all for backward compatibility
export * from './syncState';
export * from './errorHandling';
export * from './timestamp';
