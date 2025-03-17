
/**
 * آليات قوية لإجبار تحديث الصفحة ومسح التخزين المؤقت
 * Strong mechanisms to force page refresh and clear cache
 */

import { addCacheBusterToUrl } from '../sync/remote/fetch/retryStrategies';
import { applyStorageMarkers } from '../sync/remote/fetch/retryStrategies';

/**
 * حذف ملفات الكوكيز للموقع
 * Clear site cookies
 */
export const clearSiteCookies = (): boolean => {
  try {
    // محاولة مسح الكوكيز عن طريق إعادة تعيينها
    const cookies = document.cookie.split(";");
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    
    console.log("تم مسح جميع ملفات الكوكيز");
    return true;
  } catch (e) {
    console.error("فشل في مسح ملفات الكوكيز:", e);
    return false;
  }
};

/**
 * حذف التخزين المؤقت للخادم المشترك
 * Clear service worker cache
 */
export const clearServiceWorkerCache = async (): Promise<boolean> => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log("تم مسح ذاكرة التخزين المؤقت للخادم المشترك");
      return true;
    }
    return false;
  } catch (e) {
    console.error("فشل في مسح ذاكرة التخزين المؤقت للخادم المشترك:", e);
    return false;
  }
};

/**
 * مسح التخزين المؤقت للصفحة
 * Clear page cache
 */
export const clearPageCache = async (): Promise<boolean> => {
  try {
    // مسح ذاكرة التخزين المحلي (للبيانات المؤقتة فقط)
    const keysToPreserve = [
      'tv_channels', 'tv_countries', 'tv_categories', 
      'tv_favorites', 'tv_settings', 'tv_recent_channels',
      'tv_admin_password', 'dark-mode'
    ];
    
    // مسح العناصر التي لا نريد الاحتفاظ بها
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key) && !key.includes('persist:')) {
        localStorage.removeItem(key);
      }
    }
    
    // إضافة علامات تحديث جديدة
    applyStorageMarkers();
    
    // مسح ذاكرة الجلسة بالكامل
    sessionStorage.clear();
    
    // مسح الكوكيز
    await clearSiteCookies();
    
    // مسح ذاكرة الخادم المشترك
    await clearServiceWorkerCache();
    
    console.log("تم مسح ذاكرة التخزين المؤقت للصفحة");
    
    return true;
  } catch (e) {
    console.error("فشل في مسح ذاكرة التخزين المؤقت للصفحة:", e);
    return false;
  }
};

/**
 * إعادة تحميل الصفحة بشكل فوري مع منع التخزين المؤقت
 * Reload page immediately with cache prevention
 */
export const immediateRefresh = async (): Promise<void> => {
  try {
    // مسح ذاكرة التخزين المؤقت قبل إعادة التحميل
    await clearPageCache();
    
    // إضافة علامات تحديث للتخزين المحلي
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('nocache_version', Date.now().toString());
    localStorage.setItem('data_version', Date.now().toString());
    localStorage.setItem('force_update', 'true');
    localStorage.setItem('cache_bust_time', Date.now().toString());
    localStorage.setItem('hard_refresh_trigger', 'true');
    
    // إنشاء رابط مع معلمات لمنع التخزين المؤقت
    const currentPath = window.location.pathname;
    const baseUrl = window.location.origin + currentPath;
    const cacheBuster = `_nocache=${Date.now()}&_t=${Math.random()}`;
    const urlWithParams = baseUrl + (baseUrl.includes('?') ? '&' : '?') + cacheBuster;
    
    // إعادة تحميل الصفحة بالرابط الجديد
    console.log("جاري إعادة تحميل الصفحة مع منع التخزين المؤقت:", urlWithParams);
    window.location.href = urlWithParams;
  } catch (e) {
    console.error("فشل في إعادة تحميل الصفحة:", e);
    // محاولة إعادة التحميل بالطريقة العادية
    window.location.reload();
  }
};

/**
 * إجبار تحديث البيانات
 * Force data refresh
 */
export const forceDataRefresh = async (): Promise<boolean> => {
  try {
    // إضافة علامات تحديث للتخزين المحلي
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('nocache_version', Date.now().toString());
    localStorage.setItem('data_version', Date.now().toString());
    localStorage.setItem('force_update', 'true');
    localStorage.setItem('cache_bust_time', Date.now().toString());
    localStorage.setItem('hard_refresh_trigger', 'true');
    
    // إطلاق حدث لتحديث المكونات
    const event = new CustomEvent('force_data_refresh', { 
      detail: { timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
    
    // مسح ذاكرة التخزين المؤقت المرتبطة بالبيانات
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('last_sync') ||
        key.includes('cache') ||
        key.includes('timestamp') ||
        key.includes('tv_sync_') ||
        key.includes('connection')
      )) {
        localStorage.removeItem(key);
      }
    }
    
    console.log("تم إجبار تحديث البيانات");
    return true;
  } catch (e) {
    console.error("فشل في إجبار تحديث البيانات:", e);
    return false;
  }
};

/**
 * حذف جميع بيانات التطبيق وإعادة الضبط
 * Clear all app data and reset
 */
export const resetAppData = async (): Promise<boolean> => {
  try {
    // حفظ إعدادات الوضع المظلم
    const darkMode = localStorage.getItem('dark-mode');
    
    // مسح جميع بيانات التخزين المحلي
    localStorage.clear();
    
    // استعادة إعدادات الوضع المظلم إذا كانت موجودة
    if (darkMode) {
      localStorage.setItem('dark-mode', darkMode);
    }
    
    // مسح ذاكرة الجلسة
    sessionStorage.clear();
    
    // مسح الكوكيز
    await clearSiteCookies();
    
    // مسح ذاكرة الخادم المشترك
    await clearServiceWorkerCache();
    
    console.log("تم إعادة ضبط جميع بيانات التطبيق");
    
    return true;
  } catch (e) {
    console.error("فشل في إعادة ضبط بيانات التطبيق:", e);
    return false;
  }
};
