
/**
 * حالة قفل المزامنة - منع المزامنات المتزامنة
 * Sync lock state - preventing simultaneous syncs
 */

// مهلة القفل (بالمللي ثانية)
// Lock timeout (in milliseconds)
export const LOCK_TIMEOUT = 60000; // 60 ثانية

// حالة القفل
// Lock state
let isLocked = false;
let lockOwner: string | null = null;
let lockTime: number = 0;

/**
 * التحقق مما إذا كانت المزامنة مقفلة
 * Check if sync is locked
 */
export const isSyncLocked = (): boolean => {
  // فحص ما إذا كان القفل قديمًا
  // Check if lock is stale
  if (isLocked && Date.now() - lockTime > LOCK_TIMEOUT) {
    console.warn(`تم اكتشاف قفل قديم (تم إنشاؤه في ${new Date(lockTime).toISOString()})، جارٍ إلغاء القفل تلقائيًا`);
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

  console.log(`تم وضع قفل المزامنة: ${owner}`);
  isLocked = true;
  lockOwner = owner;
  lockTime = Date.now();
  
  // تخزين حالة القفل في الجلسة للاسترداد في حالة تحديث الصفحة
  // Store lock state in session for recovery in case of page refresh
  try {
    sessionStorage.setItem('sync_lock_state', JSON.stringify({
      isLocked,
      lockOwner,
      lockTime
    }));
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
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

  console.log(`تحرير قفل المزامنة`);
  isLocked = false;
  lockOwner = null;
  lockTime = 0;
  
  // مسح حالة القفل المخزنة
  // Clear stored lock state
  try {
    sessionStorage.removeItem('sync_lock_state');
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
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
    isStale: isLocked && Date.now() - lockTime > LOCK_TIMEOUT
  };
};
