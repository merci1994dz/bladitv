
/**
 * مسؤول عن إدارة أوقات المزامنة
 */

import { STORAGE_KEYS } from '../../config';

/**
 * تعيين طابع وقت المزامنة
 */
export const setSyncTimestamp = (timestamp: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, timestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp); // للتوافق مع التطبيقات القديمة
  } catch (e) {
    console.error('خطأ في تعيين وقت المزامنة:', e);
  }
};

/**
 * الحصول على آخر وقت مزامنة
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (e) {
    console.error('خطأ في الحصول على آخر وقت مزامنة:', e);
    return null;
  }
};
