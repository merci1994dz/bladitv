
/**
 * وظائف تحديث البيانات القسري
 * Force refresh functions for data
 */

/**
 * تحديث فوري للصفحة
 * Immediate page refresh
 */
export const immediateRefresh = (): void => {
  try {
    // إضافة معلمة لمنع التخزين المؤقت عند التحديث
    const timestamp = Date.now();
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', timestamp.toString());
    
    // إعادة تحميل الصفحة
    window.location.href = url.toString();
  } catch (error) {
    console.error('خطأ في تحديث الصفحة:', error);
    
    // تحديث الصفحة بشكل بسيط في حالة الخطأ
    window.location.reload();
  }
};

/**
 * مسح ذاكرة التخزين المؤقت للصفحة
 * Clear page cache
 */
export const clearPageCache = async (): Promise<boolean> => {
  try {
    // تعيين علامات مسح التخزين المؤقت
    localStorage.setItem('nocache_version', Date.now().toString());
    localStorage.setItem('cache_cleared', 'true');
    localStorage.setItem('cache_cleared_time', new Date().toISOString());
    
    // محاولة مسح ذاكرة التخزين المؤقت للمتصفح إذا كانت متاحة
    if ('caches' in window) {
      await caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      });
    }
    
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
    // مسح علامات التخزين المؤقت للبيانات
    localStorage.setItem('data_version', Date.now().toString());
    localStorage.setItem('force_data_refresh', 'true');
    
    // إطلاق حدث تحديث البيانات القسري
    const event = new CustomEvent('force_data_refresh', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في فرض تحديث البيانات:', error);
    return false;
  }
};

/**
 * إعادة تعيين بيانات التطبيق
 * Reset app data
 */
export const resetAppData = async (): Promise<boolean> => {
  try {
    // مسح البيانات ذات الصلة من التخزين المحلي
    const keysToPreserve = ['auth_token', 'user_settings', 'theme_preference'];
    
    // حفظ القيم التي نريد الاحتفاظ بها
    const preservedValues: Record<string, string> = {};
    
    for (const key of keysToPreserve) {
      const value = localStorage.getItem(key);
      if (value) {
        preservedValues[key] = value;
      }
    }
    
    // مسح التخزين المحلي
    localStorage.clear();
    
    // استعادة القيم المحفوظة
    for (const [key, value] of Object.entries(preservedValues)) {
      localStorage.setItem(key, value);
    }
    
    // تعيين علامات إعادة التعيين
    localStorage.setItem('app_reset', 'true');
    localStorage.setItem('app_reset_time', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('خطأ في إعادة تعيين بيانات التطبيق:', error);
    return false;
  }
};
