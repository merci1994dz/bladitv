
/**
 * آلية قفل المزامنة المحسنة لمنع المزامنات المتزامنة
 * Enhanced sync locking mechanism to prevent simultaneous syncs
 */

// تصدير الوظائف الأساسية من نظام القفل
// Export core functions from the lock system
import { 
  isSyncLocked, 
  setSyncLock, 
  releaseSyncLock, 
  LOCK_TIMEOUT, 
  getLockState,
  tryAcquireLock 
} from './lockState';

import { 
  addToSyncQueue, 
  processNextQueueItem,
  getQueueState,
  cleanupStaleQueueItems 
} from './queueManager';

import { 
  setupLockMonitoring, 
  restoreLockStateFromSession,
  checkActiveLocks 
} from './lockMonitor';

// تهيئة مراقبة القفل ومعالجة الحالة المستعادة
// Initialize lock monitoring and restored state handling
if (typeof window !== 'undefined') {
  // استعادة حالة القفل إذا لزم الأمر
  // Restore lock state if needed
  restoreLockStateFromSession();
  
  // إعداد المراقبة الدورية للقفل
  // Setup periodic lock monitoring 
  setupLockMonitoring();
  
  // تنظيف طابور المزامنة عند التحميل
  // Clean up sync queue on load
  cleanupStaleQueueItems();
  
  // إضافة مستمع لحدث beforeunload
  // Add beforeunload event listener
  window.addEventListener('beforeunload', () => {
    // تحرير القفل إذا كان مملوكًا من قبل هذه الصفحة
    if (isSyncLocked()) {
      releaseSyncLock();
    }
  });
  
  // إضافة مستمع لحدث visibilitychange
  // Add visibilitychange event listener
  document.addEventListener('visibilitychange', () => {
    // إذا أصبحت الصفحة غير مرئية ومضى وقت طويل، قم بتحرير القفل
    if (document.visibilityState === 'hidden' && isSyncLocked()) {
      // إضافة علامة زمنية لتتبع وقت إخفاء الصفحة
      try {
        sessionStorage.setItem('page_hidden_time', Date.now().toString());
      } catch (e) {
        // تجاهل أي خطأ
      }
    } else if (document.visibilityState === 'visible') {
      // عند العودة إلى الصفحة، تحقق مما إذا كان يجب تحرير القفل
      try {
        const hiddenTimeStr = sessionStorage.getItem('page_hidden_time');
        if (hiddenTimeStr) {
          const hiddenTime = parseInt(hiddenTimeStr, 10);
          const hiddenDuration = Date.now() - hiddenTime;
          
          // إذا كانت الصفحة مخفية لفترة طويلة وهناك قفل نشط
          if (hiddenDuration > LOCK_TIMEOUT / 2 && isSyncLocked()) {
            console.log(`تحرير القفل لأن الصفحة كانت مخفية لفترة طويلة (${Math.floor(hiddenDuration / 1000)} ثانية)`);
            releaseSyncLock();
          }
          
          // مسح وقت الإخفاء
          sessionStorage.removeItem('page_hidden_time');
        }
      } catch (e) {
        // تجاهل أي خطأ
      }
      
      // محاولة معالجة الطابور عند العودة إلى الصفحة
      setTimeout(() => {
        if (!isSyncLocked()) {
          processNextQueueItem();
        }
      }, 1000);
    }
  });
}

// تصدير جميع الوظائف المطلوبة
// Export all required functions
export {
  isSyncLocked,
  setSyncLock,
  releaseSyncLock,
  addToSyncQueue,
  processNextQueueItem,
  LOCK_TIMEOUT,
  getLockState,
  tryAcquireLock,
  getQueueState,
  cleanupStaleQueueItems,
  checkActiveLocks
};
