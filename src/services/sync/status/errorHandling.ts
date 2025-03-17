
/**
 * مسؤول عن إدارة أخطاء المزامنة وتخزينها
 */

import { STORAGE_KEYS } from '../../config';

/**
 * تعيين خطأ المزامنة
 */
export const setSyncError = (error: string | null): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_ERROR, error ? JSON.stringify({ message: error, timestamp: Date.now() }) : '');
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
export const getSyncError = (): { message: string; timestamp: number } | null => {
  try {
    const errorJson = localStorage.getItem(STORAGE_KEYS.SYNC_ERROR);
    if (!errorJson) return null;
    
    return JSON.parse(errorJson);
  } catch (e) {
    console.error('خطأ في جلب خطأ المزامنة:', e);
    return null;
  }
};
