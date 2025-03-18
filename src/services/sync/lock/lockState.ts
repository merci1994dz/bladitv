
/**
 * Core lock state management
 * إدارة حالة القفل الأساسية
 */

// حالة القفل
// Lock state
let syncLocked = false;
let syncLockTimestamp = 0;
let syncLockOwner = ''; // معرف للعملية التي تملك القفل

// تقليل مهلة القفل لتحسين التعافي من الفشل
// Reduce lock timeout to improve failure recovery
export const LOCK_TIMEOUT = 15000; // 15 ثانية بدلاً من 25 ثانية

// التحقق مما إذا كانت المزامنة مقفلة
// Check if sync is locked
export const isSyncLocked = (): boolean => {
  // التحقق من انتهاء مهلة القفل
  // Check if lock timeout has expired
  if (syncLocked && Date.now() - syncLockTimestamp > LOCK_TIMEOUT) {
    console.warn(`تجاوز الوقت المحدد للمزامنة (${LOCK_TIMEOUT}ms)، تحرير القفل بالقوة`);
    releaseSyncLock();
    return false;
  }
  return syncLocked;
};

// وضع قفل المزامنة مع تعزيز أمان القفل
// Set sync lock with enhanced lock security
export const setSyncLock = (owner = ''): boolean => {
  if (syncLocked) {
    return false;
  }
  
  syncLocked = true;
  syncLockTimestamp = Date.now();
  syncLockOwner = owner || `process-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // تسجيل حالة القفل
  // Log lock state
  console.log(`تم وضع قفل المزامنة: ${syncLockOwner}`);
  
  // تخزين معلومات القفل لفحص تعارضات القفل المحتملة
  // Store lock info to check potential lock conflicts
  try {
    const lockInfo = {
      owner: syncLockOwner,
      timestamp: syncLockTimestamp,
      timeout: LOCK_TIMEOUT
    };
    sessionStorage.setItem('sync_lock_info', JSON.stringify(lockInfo));
    
    // تعيين مؤقت لتحرير القفل تلقائياً بعد انتهاء المهلة
    // Set timer to automatically release lock after timeout
    setTimeout(() => {
      if (syncLocked && syncLockOwner === lockInfo.owner) {
        console.warn(`تحرير القفل تلقائياً بعد انتهاء المهلة: ${LOCK_TIMEOUT}ms`);
        releaseSyncLock(lockInfo.owner);
      }
    }, LOCK_TIMEOUT + 1000);
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
  }
  
  return true;
};

// تحرير قفل المزامنة
// Release sync lock
export const releaseSyncLock = (owner = ''): boolean => {
  // التحقق من المالك للأمان (إذا تم تحديده)
  // Check owner for security (if specified)
  if (owner && syncLockOwner && owner !== syncLockOwner) {
    console.warn(`محاولة تحرير قفل مملوك لعملية أخرى (${syncLockOwner} != ${owner})، تجاهل`);
    return false;
  }
  
  console.log(`تحرير قفل المزامنة${owner ? ` (${owner})` : ''}`);
  
  syncLocked = false;
  syncLockTimestamp = 0;
  syncLockOwner = '';
  
  // مسح معلومات القفل المخزنة
  // Clear stored lock info
  try {
    sessionStorage.removeItem('sync_lock_info');
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
  }
  
  return true;
};

// تصدير الحالة الداخلية لاختبارات والاستخدامات المتقدمة
// Export internal state for testing and advanced uses
export const getLockState = () => ({
  isLocked: syncLocked,
  timestamp: syncLockTimestamp,
  owner: syncLockOwner
});
