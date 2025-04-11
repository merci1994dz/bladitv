
/**
 * وظائف التحكم في التخزين المؤقت وعرض أحدث البيانات
 * Cache control functions and displaying the latest data
 */

import { applyStorageMarkers, preventCacheForAllRequests } from '@/services/sync/remote/fetch/retryStrategies';
import { clearPageCache, forceDataRefresh } from '@/services/sync/forceRefresh';

/**
 * تعطيل التخزين المؤقت وضمان عرض أحدث البيانات
 * Disable caching and ensure showing the latest data
 */
export const ensureLatestVersion = async (): Promise<boolean> => {
  try {
    console.log('جاري تطبيق إجراءات ضمان عرض أحدث إصدار...');
    
    // تطبيق علامات التخزين المحلي
    applyStorageMarkers();
    
    // مسح التخزين المؤقت للصفحة
    await clearPageCache();
    
    // إجبار تحديث البيانات
    await forceDataRefresh();
    
    // تفعيل منع التخزين المؤقت لجميع الطلبات المستقبلية
    preventCacheForAllRequests();
    
    // إضافة معلمات إضافية للتخزين المحلي
    localStorage.setItem('latest_version_enforced', 'true');
    localStorage.setItem('latest_version_time', new Date().toISOString());
    
    console.log('تم تطبيق جميع إجراءات ضمان عرض أحدث إصدار');
    return true;
  } catch (error) {
    console.error('خطأ في ضمان عرض أحدث إصدار:', error);
    return false;
  }
};

/**
 * تحديث فوري للصفحة مع منع التخزين المؤقت
 * Immediate page refresh with cache prevention
 */
export const refreshWithCacheBusting = (): void => {
  try {
    // إضافة معلمات لمنع التخزين المؤقت
    const url = new URL(window.location.href);
    
    // إزالة معلمات منع التخزين المؤقت الحالية
    Array.from(url.searchParams.keys()).forEach(key => {
      if (
        key.includes('cache') || 
        key.includes('nocache') || 
        key.includes('timestamp') || 
        key.includes('ts') || 
        key.includes('_') ||
        key.includes('r') ||
        key.includes('v') ||
        key.includes('rand')
      ) {
        url.searchParams.delete(key);
      }
    });
    
    // إضافة معلمات جديدة لمنع التخزين المؤقت
    url.searchParams.set('_nocache', Date.now().toString());
    url.searchParams.set('_t', Date.now().toString());
    url.searchParams.set('_r', Math.random().toString(36).substring(2, 15));
    
    // إعداد العلامات قبل إعادة التوجيه
    localStorage.setItem('force_refresh_applied', 'true');
    localStorage.setItem('force_refresh_time', new Date().toISOString());
    
    // تنفيذ إعادة التوجيه بمعلمات منع التخزين المؤقت
    window.location.href = url.toString();
  } catch (error) {
    console.error('خطأ في تحديث الصفحة مع منع التخزين المؤقت:', error);
    
    // محاولة استخدام طريقة بديلة أبسط
    window.location.reload();
  }
};

// تطبيق منع التخزين المؤقت عند استيراد الملف
preventCacheForAllRequests();
