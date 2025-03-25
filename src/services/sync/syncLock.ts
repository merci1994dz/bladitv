
/**
 * آلية قفل المزامنة المحسنة لمنع المزامنات المتزامنة
 * Enhanced synchronization locking mechanism to prevent simultaneous syncs
 */

// Re-export everything from the new modular structure
export * from './lock';

// Export additional utilities for backward compatibility
export const getIsLocked = () => {
  const { isSyncLocked } = require('./lock');
  return isSyncLocked();
};

export const getLockInfo = () => {
  const { getLockState } = require('./lock');
  return getLockState();
};

