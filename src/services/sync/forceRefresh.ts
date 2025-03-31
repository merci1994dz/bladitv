/**
 * وظائف تحديث البيانات الإجباري
 * Functions for forcing data refresh
 */

import { clearSyncError } from './status/errorHandling';

/**
 * مسح ذاكرة التخزين المؤقت للصفحة
 * Clear page cache
 */
export const clearPageCache = async (): Promise<boolean> => {
  try {
    // مسح ذاكرة التخزين المؤقت إذا كانت متوفرة في المتصفح
    // Clear cache if available in browser
    if ('caches' in window) {
      // الحصول على قائمة اسماء التخزين المؤقت
      // Get list of cache names
      const cacheNames = await caches.keys();
      
      // مسح كل ذاكرة تخزين مؤقت
      // Clear each cache
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('تم مسح ذاكرة التخزين المؤقت للصفحة بنجاح');
      return true;
    }
    
    console.warn('واجهة برمجة التطبيقات للتخزين المؤقت غير متاحة في هذا المتصفح');
    return false;
  } catch (error) {
    console.error('خطأ في مسح ذاكرة التخزين المؤقت للصفحة:', error);
    return false;
  }
};

/**
 * فرض تحديث البيانات
 * Force data refresh
 */
export const forceDataRefresh = async (): Promise<boolean> => {
  try {
    // تعيين علامات التحديث الإجباري
    // Set force refresh flags
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('force_data_refresh', 'true');
    localStorage.setItem('nocache_version', Date.now().toString());
    
    // مسح أي أخطاء مزامنة سابقة
    // Clear any previous sync errors
    clearSyncError();
    
    // مسح ذاكرة التخزين المؤقت
    // Clear cache
    const cacheCleared = await clearPageCache();
    
    return cacheCleared;
  } catch (error) {
    console.error('خطأ في فرض تحديث البيانات:', error);
    return false;
  }
};

/**
 * إعادة تشغيل تطبيق كامل
 * Immediate full app refresh
 */
export const immediateRefresh = () => {
  try {
    // تعيين علامة التحديث الإجباري
    // Set force refresh flag
    localStorage.setItem('force_refresh', 'true');
    
    // إعادة تحميل الصفحة بدون تخزين مؤقت
    // Reload page without cache
    window.location.reload();
  } catch (error) {
    console.error('خطأ في إعادة تشغيل التطبيق:', error);
  }
};

/**
 * إعادة تعيين بيانات التطبيق بالكامل
 * Reset all app data
 */
export const resetAppData = async (): Promise<boolean> => {
  try {
    // تعيين علامة إعادة تعيين البيانات
    // Set data reset flag
    localStorage.setItem('reset_app_data', 'true');
    
    // مسح جميع بيانات التطبيق من التخزين المحلي
    // Clear all app data from local storage
    const keysToKeep = ['theme', 'user_preferences', 'language'];
    
    // حفظ القيم التي نريد الاحتفاظ بها
    // Save values we want to keep
    const savedValues: Record<string, string | null> = {};
    
    for (const key of keysToKeep) {
      savedValues[key] = localStorage.getItem(key);
    }
    
    // مسح التخزين المحلي
    // Clear local storage
    localStorage.clear();
    
    // استعادة القيم المحفوظة
    // Restore saved values
    for (const key of keysToKeep) {
      if (savedValues[key] !== null) {
        localStorage.setItem(key, savedValues[key]!);
      }
    }
    
    // مسح ذاكرة التخزين المؤقت
    // Clear cache
    await clearPageCache();
    
    console.log('تم إعادة تعيين بيانات التطبيق بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في إعادة تعيين بيانات التطبيق:', error);
    return false;
  }
};
