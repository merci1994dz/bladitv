
/**
 * مسؤول عن إدارة أخطاء المزامنة وتخزينها
 */

import { STORAGE_KEYS } from '../../config';

interface SyncErrorData {
  message: string;
  timestamp: number;
  source?: string;
  retryable?: boolean;
  attemptCount?: number;
}

/**
 * تعيين خطأ المزامنة مع معلومات إضافية
 */
export const setSyncError = (
  error: string | null,
  options?: {
    source?: string;
    retryable?: boolean;
    attemptCount?: number;
  }
): void => {
  try {
    if (error) {
      const errorData: SyncErrorData = {
        message: error,
        timestamp: Date.now(),
        ...options
      };
      localStorage.setItem(STORAGE_KEYS.SYNC_ERROR, JSON.stringify(errorData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SYNC_ERROR);
    }
  } catch (e) {
    console.error('خطأ في تعيين خطأ المزامنة:', e);
  }
};

/**
 * مسح خطأ المزامنة
 */
export const clearSyncError = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SYNC_ERROR);
  } catch (e) {
    console.error('خطأ في مسح خطأ المزامنة:', e);
  }
};

/**
 * جلب آخر خطأ مزامنة
 */
export const getSyncError = (): SyncErrorData | null => {
  try {
    const errorJson = localStorage.getItem(STORAGE_KEYS.SYNC_ERROR);
    if (!errorJson) return null;
    
    return JSON.parse(errorJson);
  } catch (e) {
    console.error('خطأ في جلب خطأ المزامنة:', e);
    return null;
  }
};

/**
 * زيادة عداد محاولات التزامن المتعلقة بالخطأ الحالي
 */
export const incrementSyncErrorAttempts = (): number => {
  try {
    const currentError = getSyncError();
    if (!currentError) return 0;
    
    const currentAttempts = currentError.attemptCount || 0;
    const newAttempts = currentAttempts + 1;
    
    setSyncError(currentError.message, {
      source: currentError.source,
      retryable: currentError.retryable,
      attemptCount: newAttempts
    });
    
    return newAttempts;
  } catch (e) {
    console.error('خطأ في زيادة عداد محاولات المزامنة:', e);
    return 0;
  }
};

/**
 * تحقق مما إذا كان الخطأ الحالي قابل لإعادة المحاولة
 */
export const isSyncErrorRetryable = (): boolean => {
  try {
    const currentError = getSyncError();
    if (!currentError) return false;
    
    // إذا تم تحديد قابلية إعادة المحاولة صراحةً، استخدمها
    if (typeof currentError.retryable === 'boolean') {
      return currentError.retryable;
    }
    
    // التحقق من رسالة الخطأ لتحديد ما إذا كان قابلاً لإعادة المحاولة
    const message = currentError.message.toLowerCase();
    return (
      message.includes('شبكة') ||
      message.includes('اتصال') ||
      message.includes('مهلة') ||
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connect')
    );
  } catch (e) {
    console.error('خطأ في التحقق من قابلية إعادة المحاولة:', e);
    return false;
  }
};
