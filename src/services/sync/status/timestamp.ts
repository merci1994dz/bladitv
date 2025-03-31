
/**
 * إدارة طوابع الوقت للمزامنة
 * Sync timestamp management
 */

/**
 * تعيين طابع وقت المزامنة
 * Set sync timestamp
 */
export const setSyncTimestamp = () => {
  const now = new Date();
  
  try {
    localStorage.setItem('last_sync_time', now.toISOString());
    localStorage.setItem('last_sync_timestamp', now.getTime().toString());
  } catch (e) {
    console.error('فشل في تعيين طابع وقت المزامنة:', e);
  }
};

/**
 * الحصول على وقت آخر مزامنة
 * Get last sync time
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem('last_sync_time');
  } catch (e) {
    console.error('فشل في الحصول على وقت آخر مزامنة:', e);
    return null;
  }
};

/**
 * الحصول على طابع وقت آخر مزامنة
 * Get last sync timestamp
 */
export const getLastSyncTimestamp = (): number | null => {
  try {
    const timestampStr = localStorage.getItem('last_sync_timestamp');
    return timestampStr ? parseInt(timestampStr, 10) : null;
  } catch (e) {
    console.error('فشل في الحصول على طابع وقت آخر مزامنة:', e);
    return null;
  }
};
