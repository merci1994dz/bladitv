
/**
 * إدارة حالة المزامنة والمعلومات المرتبطة بها
 * Managing sync state and related information
 */

// حد أقصى لعدد محاولات المزامنة المتتالية
// Maximum number of consecutive sync attempts
export const MAX_CONSECUTIVE_SYNCS = 3;

// تخزين معلومات عن محاولات المزامنة
// Store information about sync attempts
export const syncState = {
  consecutiveSyncAttempts: 0,
  lastSyncAttemptTime: 0,
  totalSyncAttempts: 0,
  failedAttempts: 0,
  cooldownPeriodMs: 5000, // 5 ثوانٍ كفترة انتظار أساسية
  syncInProgress: false,
  lastSuccessfulSync: 0
};

// استيراد الدالة المساعدة مباشرة بدلاً من استخدام require
import { isCooldownComplete } from './helpers/timeoutHelper';

/**
 * إعادة تعيين عدد المحاولات المتتالية
 * Reset consecutive attempts counter
 */
export const resetConsecutiveAttempts = () => {
  // إعادة تعيين فقط إذا مر وقت كافٍ منذ آخر محاولة
  if (isCooldownComplete(syncState.lastSyncAttemptTime, syncState.cooldownPeriodMs * 2)) {
    console.log('إعادة تعيين عداد المحاولات المتتالية بعد فترة سماح كافية');
    syncState.consecutiveSyncAttempts = 0;
    syncState.failedAttempts = 0;
  }
};
