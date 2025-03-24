
/**
 * مراقبة القفل واستعادة الحالة
 * Lock monitoring and state recovery
 */

import { isSyncLocked, releaseSyncLock, getLockState, LOCK_TIMEOUT } from './lockState';

// إعداد مراقبة دورية للقفل - للتحقق من حالات القفل العالقة
// Set up periodic lock monitoring - to check for stuck locks
export const setupLockMonitoring = (): (() => void) => {
  console.log('بدء مراقبة قفل المزامنة');
  
  // فحص القفل كل 20 ثانية وتحريره إذا كان قديمًا
  // Check lock every 20 seconds and release if stale
  const intervalId = setInterval(() => {
    const lockState = getLockState();
    
    if (lockState.isStale) {
      console.warn('تم اكتشاف قفل عالق أثناء المراقبة الدورية، جارٍ تحريره');
      releaseSyncLock();
    }
  }, 20000);
  
  // إعادة دالة التنظيف
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

// استعادة حالة القفل من التخزين - مفيد في حالات تحديث الصفحة
// Restore lock state from storage - useful for page refresh cases
export const restoreLockStateFromSession = (): void => {
  try {
    const storedLockState = sessionStorage.getItem('sync_lock_state');
    
    if (storedLockState) {
      const lockState = JSON.parse(storedLockState);
      
      // إذا كان القفل قديمًا، قم بتحريره بدلاً من استعادته
      // If lock is stale, release it instead of restoring
      if (Date.now() - lockState.lockTime > LOCK_TIMEOUT) {
        console.log('تم العثور على قفل قديم في التخزين، جارٍ تحريره');
        sessionStorage.removeItem('sync_lock_state');
      } else {
        console.log('تمت استعادة حالة قفل المزامنة من التخزين');
      }
    }
  } catch (e) {
    console.error('فشل في استعادة حالة قفل المزامنة:', e);
  }
};
