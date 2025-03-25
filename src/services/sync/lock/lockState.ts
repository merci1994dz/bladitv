
/**
 * حالة قفل المزامنة - منع المزامنات المتزامنة
 * Sync lock state - preventing simultaneous syncs
 */

// مهلة القفل (بالمللي ثانية)
// Lock timeout (in milliseconds)
export const LOCK_TIMEOUT = 45000; // تخفيض من 60 ثانية إلى 45 ثانية

// حالة القفل
// Lock state
let isLocked = false;
let lockOwner: string | null = null;
let lockTime: number = 0;
let lockId: string = '';

/**
 * التحقق مما إذا كانت المزامنة مقفلة
 * Check if sync is locked
 */
export const isSyncLocked = (): boolean => {
  // فحص ما إذا كان القفل قديمًا
  // Check if lock is stale
  if (isLocked && Date.now() - lockTime > LOCK_TIMEOUT) {
    console.warn(`تم اكتشاف قفل قديم (تم إنشاؤه في ${new Date(lockTime).toISOString()}) بواسطة ${lockOwner}, جارٍ إلغاء القفل تلقائيًا`);
    releaseSyncLock();
    return false;
  }

  return isLocked;
};

/**
 * وضع قفل المزامنة
 * Set sync lock
 */
export const setSyncLock = (owner: string = 'default'): boolean => {
  if (isLocked) {
    console.warn(`محاولة وضع قفل المزامنة أثناء وجود قفل نشط بالفعل من قبل ${lockOwner}`);
    return false;
  }

  // إنشاء معرف فريد للقفل
  lockId = `lock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  console.log(`تم وضع قفل المزامنة: ${owner} (${lockId})`);
  isLocked = true;
  lockOwner = owner;
  lockTime = Date.now();
  
  // تخزين حالة القفل في الجلسة للاسترداد في حالة تحديث الصفحة
  // Store lock state in session for recovery in case of page refresh
  try {
    sessionStorage.setItem('sync_lock_state', JSON.stringify({
      isLocked,
      lockOwner,
      lockTime,
      lockId
    }));
    
    // وضع علامة في localStorage أيضًا لتمكين التواصل بين علامات التبويب المختلفة
    localStorage.setItem('sync_lock_active', JSON.stringify({
      isLocked: true,
      lockOwner,
      lockTime,
      lockId
    }));
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
    console.warn('خطأ في تخزين حالة القفل:', e);
  }

  return true;
};

/**
 * تحرير قفل المزامنة
 * Release sync lock
 */
export const releaseSyncLock = (owner: string = 'any'): boolean => {
  // إذا كان هناك مالك محدد للقفل، تحقق مما إذا كان المالك الحالي
  // If a specific lock owner is provided, check if it's the current owner
  if (lockOwner !== null && owner !== 'any' && lockOwner !== owner) {
    console.warn(`محاولة تحرير قفل غير مملوك. المالك الحالي: ${lockOwner}, المطلوب: ${owner}`);
    return false;
  }

  const oldLockId = lockId;
  console.log(`تحرير قفل المزامنة (${oldLockId})`);
  isLocked = false;
  lockOwner = null;
  lockTime = 0;
  lockId = '';
  
  // مسح حالة القفل المخزنة
  // Clear stored lock state
  try {
    sessionStorage.removeItem('sync_lock_state');
    localStorage.removeItem('sync_lock_active');
    
    // إرسال حدث مخصص لإعلام علامات التبويب الأخرى بتحرير القفل
    const event = new CustomEvent('sync_lock_released', { 
      detail: { lockId: oldLockId, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
    console.warn('خطأ في مسح حالة القفل:', e);
  }

  return true;
};

/**
 * الحصول على حالة القفل الحالية
 * Get current lock state
 */
export const getLockState = () => {
  return {
    isLocked,
    lockOwner,
    lockTime,
    lockId,
    isStale: isLocked && Date.now() - lockTime > LOCK_TIMEOUT
  };
};

/**
 * محاولة اكتساب القفل بانتظار لفترة محددة
 * Try to acquire lock with a specified waiting period
 */
export const tryAcquireLock = async (owner: string, maxWaitMs: number = 5000): Promise<boolean> => {
  const startTime = Date.now();
  
  // محاولة الحصول على القفل فورا
  if (!isSyncLocked()) {
    return setSyncLock(owner);
  }
  
  // انتظار حتى يتم تحرير القفل أو تجاوز الوقت المحدد
  return new Promise(resolve => {
    const checkInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      
      // تحقق مما إذا كان الوقت قد نفد
      if (elapsedTime > maxWaitMs) {
        clearInterval(checkInterval);
        resolve(false);
        return;
      }
      
      // تحقق مما إذا كان القفل متاحًا الآن
      if (!isSyncLocked()) {
        clearInterval(checkInterval);
        resolve(setSyncLock(owner));
      }
    }, 200); // فحص كل 200 مللي ثانية
  });
};
