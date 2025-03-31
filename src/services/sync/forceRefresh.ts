
/**
 * وظائف التحديث الإجباري
 * Force refresh functions
 */

/**
 * إجبار إعادة تحميل البيانات
 * Force data refresh
 */
export const forceDataRefresh = async (): Promise<boolean> => {
  try {
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('force_refresh_timestamp', Date.now().toString());
    
    // إطلاق حدث تحديث إجباري
    const event = new CustomEvent('force_data_refresh', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في إجبار إعادة تحميل البيانات:', error);
    return false;
  }
};

/**
 * مسح التخزين المؤقت للصفحة
 * Clear page cache
 */
export const clearPageCache = async (): Promise<boolean> => {
  try {
    // تحديث إصدار البيانات لإبطال التخزين المؤقت
    localStorage.setItem('data_version', Date.now().toString());
    localStorage.setItem('nocache_version', Date.now().toString());
    
    // محاولة مسح التخزين المؤقت للصفحة (يعتمد على دعم المتصفح)
    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      for (const cacheName of cacheNames) {
        await window.caches.delete(cacheName);
      }
      console.log('تم مسح التخزين المؤقت للصفحة');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في مسح التخزين المؤقت للصفحة:', error);
    return false;
  }
};

/**
 * إعادة تعيين بيانات التطبيق
 * Reset app data
 */
export const resetAppData = async (): Promise<boolean> => {
  try {
    // مسح البيانات من التخزين المحلي
    localStorage.removeItem('channels');
    localStorage.removeItem('countries');
    localStorage.removeItem('categories');
    localStorage.removeItem('last_sync_time');
    
    // وضع علامة للتحديث الإجباري
    localStorage.setItem('force_refresh', 'true');
    
    // إطلاق حدث إعادة تعيين البيانات
    const event = new CustomEvent('app_data_reset', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في إعادة تعيين بيانات التطبيق:', error);
    return false;
  }
};
