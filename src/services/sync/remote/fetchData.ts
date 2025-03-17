
/**
 * This file has been refactored into smaller, focused modules
 * 
 * Please import from the new modules in src/services/sync/remote/fetch/* instead
 * 
 * @deprecated Use the modular imports from src/services/sync/remote/fetch instead
 */

import { 
  fetchRemoteData, 
  isRemoteUrlAccessible, 
  getSkewProtectionParams 
} from './fetch';

// Re-export for backward compatibility
export { 
  fetchRemoteData, 
  isRemoteUrlAccessible, 
  getSkewProtectionParams 
};

// Provide a warning when this file is imported
console.warn(
  'Warning: Importing from fetchData.ts is deprecated. ' +
  'Please update your imports to use the modular fetch components from src/services/sync/remote/fetch/* instead.'
);
