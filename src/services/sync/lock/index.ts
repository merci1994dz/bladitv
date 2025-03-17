
/**
 * آلية قفل المزامنة المحسنة لمنع المزامنات المتزامنة
 * Enhanced sync locking mechanism to prevent simultaneous syncs
 */

// تصدير الوظائف الأساسية من نظام القفل
// Export core functions from the lock system
import { isSyncLocked, setSyncLock, releaseSyncLock, LOCK_TIMEOUT, getLockState } from './lockState';
import { addToSyncQueue, processNextQueueItem } from './queueManager';
import { setupLockMonitoring, restoreLockStateFromSession } from './lockMonitor';

// تهيئة مراقبة القفل ومعالجة الحالة المستعادة
// Initialize lock monitoring and restored state handling
if (typeof window !== 'undefined') {
  // استعادة حالة القفل إذا لزم الأمر
  // Restore lock state if needed
  restoreLockStateFromSession();
  
  // إعداد المراقبة الدورية للقفل
  // Setup periodic lock monitoring 
  setupLockMonitoring();
}

// تصدير جميع الوظائف المطلوبة
// Export all required functions
export {
  isSyncLocked,
  setSyncLock,
  releaseSyncLock,
  addToSyncQueue,
  LOCK_TIMEOUT
};
