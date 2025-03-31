
/**
 * إدارة طوابع الوقت للمزامنة
 * Sync timestamp management
 */

// مفتاح التخزين لوقت آخر مزامنة
// Storage key for last sync time
const LAST_SYNC_TIME_KEY = 'last_sync_time';

/**
 * تعيين وقت المزامنة
 * Set sync timestamp
 */
export const setSyncTimestamp = (timestamp?: string | Date): void => {
  try {
    const timeValue = timestamp 
      ? (timestamp instanceof Date ? timestamp.toISOString() : timestamp)
      : new Date().toISOString();
    
    localStorage.setItem(LAST_SYNC_TIME_KEY, timeValue);
  } catch (error) {
    console.error('خطأ في تعيين وقت المزامنة:', error);
  }
};

/**
 * الحصول على وقت آخر مزامنة
 * Get last sync time
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(LAST_SYNC_TIME_KEY);
  } catch (error) {
    console.error('خطأ في الحصول على وقت آخر مزامنة:', error);
    return null;
  }
};
