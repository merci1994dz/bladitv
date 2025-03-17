
/**
 * مراقبة القفل - وظائف للكشف عن وإصلاح حالات القفل المعلقة
 * Lock monitoring - Functions to detect and fix stuck lock states
 */

import { isSyncLocked, releaseSyncLock, LOCK_TIMEOUT, getLockState } from './lockState';

// التحقق الدوري من انتهاء مهلة القفل
// Periodic check for lock timeout
export const setupLockMonitoring = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}; // Return empty cleanup function for SSR
  }
  
  // التحقق من القفل كل 10 ثواني
  // Check lock every 10 seconds
  const intervalId = setInterval(() => {
    if (isSyncLocked()) {
      const { timestamp } = getLockState();
      const lockDuration = Date.now() - timestamp;
      
      // التحقق بشكل متدرج
      // Check gradually
      if (lockDuration > LOCK_TIMEOUT) {
        console.warn(`تم اكتشاف قفل معلق (${lockDuration}ms > ${LOCK_TIMEOUT}ms)، تحرير القفل تلقائيًا`);
        releaseSyncLock();
      } else if (lockDuration > LOCK_TIMEOUT * 0.7) {
        // تحذير مبكر
        // Early warning
        console.warn(`قفل المزامنة مستمر لفترة طويلة (${lockDuration}ms)، قد يكون معلقًا`);
      }
    }
  }, 10000);
  
  // كشف تحديثات الصفحة وإعادة تحميلها لإعادة تعيين حالة القفل
  // Detect page updates and reloads to reset lock state
  const handleBeforeUnload = () => {
    if (isSyncLocked()) {
      console.log('إعادة تعيين قفل المزامنة قبل تحديث الصفحة');
      releaseSyncLock();
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

// فحص طول الطابور للكشف عن المشكلات المحتملة
// Check queue length to detect potential problems
export const monitorQueueLength = (queueLength: number): void => {
  if (queueLength > 3) {
    console.warn(`اكتشاف طابور مزامنة طويل: ${queueLength} عناصر`);
  }
};

// استعادة حالة القفل من sessionStorage
// Restore lock state from sessionStorage
export const restoreLockStateFromSession = (): void => {
  try {
    const lockInfoStr = sessionStorage.getItem('sync_lock_info');
    if (lockInfoStr) {
      const lockInfo = JSON.parse(lockInfoStr);
      const elapsed = Date.now() - lockInfo.timestamp;
      
      // Print debug info
      console.log(`معلومات القفل المخزنة: ${lockInfoStr}, الوقت المنقضي: ${elapsed}ms`);
      
      // إذا لم تنتهِ صلاحية القفل بعد، لا تستعيده ولكن قم بمسحه فقط
      // If lock hasn't expired yet, don't restore it, just clear it
      if (elapsed < lockInfo.timeout) {
        console.log(`مسح قفل مخزن غير منتهي الصلاحية: ${lockInfo.owner} (${elapsed}ms مضت)`);
      }
      
      // مسح المعلومات المخزنة دائمًا عند بدء التشغيل
      // Always clear stored info on startup
      sessionStorage.removeItem('sync_lock_info');
    }
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
    console.error('خطأ في استعادة معلومات القفل:', e);
  }
};
