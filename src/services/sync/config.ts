
/**
 * إعدادات المزامنة والمعلومات التهيئة
 * Sync settings and configuration information
 */

// مفاتيح التخزين المحلي
// Local storage keys
export const STORAGE_KEYS = {
  CHANNELS: 'channels',
  COUNTRIES: 'countries',
  CATEGORIES: 'categories',
  LAST_SYNC_TIME: 'last_sync_time',
  FORCE_REFRESH: 'force_refresh',
  LAST_SUCCESSFUL_SOURCE: 'last_successful_source',
  DATA_VERSION: 'data_version'
};

// وقت التخزين المؤقت للبيانات (30 دقيقة)
// Cache time for data (30 minutes)
export const DATA_CACHE_TIME = 30 * 60 * 1000;

// تحديث وقت آخر مزامنة
// Update last sync time
export const updateLastSyncTime = () => {
  try {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
  } catch (error) {
    console.error('خطأ في تحديث وقت آخر مزامنة:', error);
  }
};

// الحصول على وقت آخر مزامنة
// Get last sync time
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  } catch (error) {
    console.error('خطأ في الحصول على وقت آخر مزامنة:', error);
    return null;
  }
};

// فحص ما إذا كان التحديث الإجباري مطلوبًا
// Check if force refresh is required
export const isForceRefreshRequired = (): boolean => {
  try {
    const forceRefresh = localStorage.getItem(STORAGE_KEYS.FORCE_REFRESH);
    return forceRefresh === 'true';
  } catch (error) {
    console.error('خطأ في فحص ما إذا كان التحديث الإجباري مطلوبًا:', error);
    return false;
  }
};

// تنظيف علامة التحديث الإجباري
// Clear force refresh flag
export const clearForceRefreshFlag = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FORCE_REFRESH);
  } catch (error) {
    console.error('خطأ في تنظيف علامة التحديث الإجباري:', error);
  }
};

// فحص ما إذا كانت المزامنة مطلوبة
// Check if sync is needed
export const isSyncNeeded = (): boolean => {
  try {
    // التحقق من وجود علامة التحديث الإجباري
    // Check for force refresh flag
    if (isForceRefreshRequired()) {
      return true;
    }
    
    // التحقق من وقت آخر مزامنة
    // Check for last sync time
    const lastSyncTimeStr = getLastSyncTime();
    if (!lastSyncTimeStr) {
      return true; // لم يتم المزامنة من قبل
    }
    
    const lastSyncTime = new Date(lastSyncTimeStr).getTime();
    const currentTime = Date.now();
    
    // التحقق مما إذا كان قد مر وقت كافٍ منذ آخر مزامنة
    // Check if enough time has passed since last sync
    return (currentTime - lastSyncTime) > DATA_CACHE_TIME;
  } catch (error) {
    console.error('خطأ في فحص ما إذا كانت المزامنة مطلوبة:', error);
    return false;
  }
};
