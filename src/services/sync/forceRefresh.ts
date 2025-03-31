
/**
 * وظائف لفرض تحديث البيانات ومسح ذاكرة التخزين المؤقت
 * Functions to force data refresh and clear cache
 */

import { clearAllData } from '../dataStore';
import { STORAGE_KEYS } from './config';

/**
 * مسح ذاكرة التخزين المؤقت للصفحة
 * Clear page cache
 */
export const clearPageCache = async (): Promise<boolean> => {
  try {
    console.log('مسح ذاكرة التخزين المؤقت للصفحة...');
    
    // مسح localStorage
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.CHANNELS);
    localStorage.removeItem(STORAGE_KEYS.COUNTRIES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME);
    localStorage.removeItem(STORAGE_KEYS.DATA_VERSION);
    
    // مسح البيانات المحلية
    // Clear local data
    clearAllData();
    
    // إذا كانت واجهة تخزين ذاكرة التخزين المؤقت متاحة (في المتصفحات الحديثة)
    // If cache storage API is available (in modern browsers)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('تم مسح جميع ذاكرات التخزين المؤقت للمتصفح');
      } catch (cacheError) {
        console.warn('فشل في مسح ذاكرات التخزين المؤقت للمتصفح:', cacheError);
      }
    }
    
    console.log('تم مسح ذاكرة التخزين المؤقت بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في مسح ذاكرة التخزين المؤقت:', error);
    return false;
  }
};

/**
 * فرض تحديث البيانات
 * Force data refresh
 */
export const forceDataRefresh = async (): Promise<boolean> => {
  try {
    console.log('فرض تحديث البيانات...');
    
    // وضع علامة على أنه يجب تحديث البيانات
    // Set flag that data should be refreshed
    localStorage.setItem(STORAGE_KEYS.FORCE_REFRESH, 'true');
    
    // مسح ذاكرة التخزين المؤقت
    // Clear cache
    const cleared = await clearPageCache();
    
    return cleared;
  } catch (error) {
    console.error('خطأ في فرض تحديث البيانات:', error);
    return false;
  }
};

/**
 * تحديث فوري للصفحة
 * Immediate page refresh
 */
export const immediateRefresh = (): void => {
  try {
    // إضافة معلمة لمنع التخزين المؤقت إلى الرابط
    // Add cache-busting parameter to URL
    const cacheBuster = `_=${Date.now()}`;
    const currentUrl = window.location.href;
    const hasParams = currentUrl.includes('?');
    const newUrl = hasParams 
      ? `${currentUrl}&${cacheBuster}` 
      : `${currentUrl}?${cacheBuster}`;
    
    // إعادة تحميل الصفحة مع تجاهل ذاكرة التخزين المؤقت
    // Reload page ignoring cache
    window.location.href = newUrl;
  } catch (error) {
    console.error('خطأ في التحديث الفوري للصفحة:', error);
    
    // محاولة إعادة التحميل العادية كخطة بديلة
    // Try normal reload as fallback
    window.location.reload();
  }
};
