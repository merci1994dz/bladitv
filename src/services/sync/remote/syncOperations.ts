
/**
 * This file has been refactored into smaller, focused modules
 * 
 * Please import from the new modules in src/services/sync/remote/sync/* instead
 * 
 * @deprecated Use the modular imports from src/services/sync/remote/sync instead
 */

import { syncWithRemoteSource, checkBladiInfoAvailability, getSkewProtectionParams } from './sync';
// Import syncWithBladiInfo directly from bladiInfoSync where it's defined
import { syncWithBladiInfo } from './sync/bladiInfoSync';

// Re-export for backward compatibility
export { 
  syncWithRemoteSource, 
  syncWithBladiInfo, 
  checkBladiInfoAvailability,
  getSkewProtectionParams
};

// Provide a warning when this file is imported
console.warn(
  'Warning: Importing from syncOperations.ts is deprecated. ' +
  'Please update your imports to use the modular sync components from src/services/sync/remote/sync/* instead.'
);
