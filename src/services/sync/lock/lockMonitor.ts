
/**
 * مراقبة القفل واستعادة الحالة
 * Lock monitoring and state recovery
 */

import { isSyncLocked, releaseSyncLock, getLockState, LOCK_TIMEOUT } from './lockState';
import { processNextQueueItem } from './queueManager';

// إعداد مراقبة دورية للقفل - للتحقق من حالات القفل العالقة
// Set up periodic lock monitoring - to check for stuck locks
export const setupLockMonitoring = (): (() => void) => {
  console.log('بدء مراقبة قفل المزامنة');
  
  // فحص القفل كل 15 ثانية وتحريره إذا كان قديمًا
  // Check lock every 15 seconds and release if stale
  const intervalId = setInterval(() => {
    const lockState = getLockState();
    
    if (lockState.isStale) {
      console.warn('تم اكتشاف قفل عالق أثناء المراقبة الدورية، جارٍ تحريره');
      releaseSyncLock();
      
      // محاولة معالجة العنصر التالي في طابور المزامنة بعد تحرير القفل
      setTimeout(() => {
        processNextQueueItem();
      }, 500);
    }
  }, 15000); // تخفيض من 20 ثانية إلى 15 ثانية
  
  // إعداد مستمع لأحداث تحرير القفل من علامات التبويب الأخرى
  const handleLockReleased = () => {
    console.log('تم استلام إشعار بتحرير قفل من علامة تبويب أخرى');
    
    // محاولة معالجة العنصر التالي في طابور المزامنة
    setTimeout(() => {
      processNextQueueItem();
    }, 500);
  };
  
  // إعداد مستمع لتغيرات التخزين المحلي
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'sync_lock_active' && !event.newValue) {
      console.log('تم اكتشاف تحرير قفل من علامة تبويب أخرى عبر التخزين المحلي');
      
      // محاولة معالجة العنصر التالي في طابور المزامنة
      setTimeout(() => {
        processNextQueueItem();
      }, 500);
    }
  };
  
  window.addEventListener('sync_lock_released', handleLockReleased);
  window.addEventListener('storage', handleStorageChange);
  
  // إعادة دالة التنظيف
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('sync_lock_released', handleLockReleased);
    window.removeEventListener('storage', handleStorageChange);
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
        localStorage.removeItem('sync_lock_active');
      } else {
        console.log('تمت استعادة حالة قفل المزامنة من التخزين');
        // لا نقوم باستعادة القفل نفسه، ولكن نتركه غير مقفل
        // تتيح هذه الاستراتيجية البدء بحالة نظيفة بعد تحديث الصفحة
      }
    }
  } catch (e) {
    console.error('فشل في استعادة حالة قفل المزامنة:', e);
  }
};

// فحص إذا كان هناك قفل نشط في الصفحة الحالية أو في علامات تبويب أخرى
// Check if there is an active lock in the current page or other tabs
export const checkActiveLocks = (): boolean => {
  // تحقق من وجود قفل محلي
  if (isSyncLocked()) {
    return true;
  }
  
  // تحقق من وجود قفل في علامات تبويب أخرى
  try {
    const activeLockStr = localStorage.getItem('sync_lock_active');
    if (activeLockStr) {
      const activeLock = JSON.parse(activeLockStr);
      
      // تحقق مما إذا كان القفل حديثًا (غير قديم)
      if (activeLock.isLocked && Date.now() - activeLock.lockTime < LOCK_TIMEOUT) {
        return true;
      } else if (activeLock.isLocked) {
        // إذا كان القفل قديمًا، قم بإزالته
        localStorage.removeItem('sync_lock_active');
      }
    }
  } catch (e) {
    console.warn('خطأ في فحص الأقفال النشطة:', e);
  }
  
  return false;
};
