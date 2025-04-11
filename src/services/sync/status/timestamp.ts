
/**
 * إدارة طوابع الوقت للمزامنة
 * Timestamp management for synchronization
 */

// مفتاح التخزين المحلي لوقت آخر مزامنة
// Local storage key for last sync time
const LAST_SYNC_TIME_KEY = 'bladi_last_sync_time';

/**
 * الحصول على وقت آخر مزامنة
 * Get last synchronization time
 * 
 * @returns وقت آخر مزامنة أو null
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(LAST_SYNC_TIME_KEY);
  } catch (e) {
    console.error('خطأ في قراءة وقت آخر مزامنة:', e);
    return null;
  }
};

/**
 * تعيين وقت آخر مزامنة
 * Set last synchronization time
 */
export const setSyncTimestamp = (): void => {
  try {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_TIME_KEY, now);
  } catch (e) {
    console.error('خطأ في تعيين وقت آخر مزامنة:', e);
  }
};

/**
 * تحديث وقت آخر مزامنة
 * Update last synchronization time
 */
export const updateLastSyncTime = setSyncTimestamp;

