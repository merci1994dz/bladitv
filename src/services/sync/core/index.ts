
/**
 * مؤشر التصدير الرئيسي لوظائف المزامنة الأساسية
 * Main export index for core sync functions
 */

// تصدير الوظائف الرئيسية
// Export core functions
export { syncAllData, performInitialSync } from './syncOperations';
export { checkSourceAvailability } from './sourceCheck';
export { initializeSyncProcess } from './initialization/initProcess';

// تصدير المساعدين
// Export helpers
export { executeSync } from './helpers/syncExecutor';
export { createTimeoutPromise, isCooldownComplete, calculateAdaptiveWaitTime } from './helpers/timeoutHelper';
export { syncState, resetConsecutiveAttempts, MAX_CONSECUTIVE_SYNCS } from './syncState';

// تصدير واجهة المزامنة الموحدة
// Export unified sync interface
export { syncDataUnified, getSyncStatus, syncWithSupabaseUnified } from './unifiedSync';
