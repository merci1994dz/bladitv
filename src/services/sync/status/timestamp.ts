
/**
 * إدارة طوابع الوقت للمزامنة
 * Sync timestamp management
 */

// Key for storing the last sync timestamp
const LAST_SYNC_KEY = 'last_sync_time';

/**
 * تحديث طابع الوقت للمزامنة الأخيرة
 * Update the last sync timestamp
 */
export const setSyncTimestamp = (): void => {
  try {
    const now = new Date();
    localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
  } catch (e) {
    console.error('تعذر تعيين طابع وقت المزامنة:', e);
  }
};

/**
 * الحصول على طابع الوقت للمزامنة الأخيرة
 * Get the last sync timestamp
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch (e) {
    console.error('تعذر قراءة طابع وقت المزامنة:', e);
    return null;
  }
};
