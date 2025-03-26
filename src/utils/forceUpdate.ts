
/**
 * وظائف لإجبار المتصفح على تحديث الواجهة وعرض آخر البيانات
 */

import { addForceRefreshMarkers } from '@/services/sync/publish/updateMarkers';

/**
 * إجبار تحديث واجهة المستخدم بآخر البيانات
 */
export const forceUIUpdate = (): boolean => {
  try {
    // إضافة علامات للتخزين المحلي
    const timestamp = Date.now().toString();
    localStorage.setItem('ui_refresh', timestamp);
    localStorage.setItem('force_ui_update', 'true');
    localStorage.setItem('last_ui_update', timestamp);
    
    // إرسال حدث تحديث مخصص
    window.dispatchEvent(new CustomEvent('force_ui_update', { 
      detail: { timestamp } 
    }));
    
    // إجبار React على إعادة التصيير لبعض المكونات
    try {
      const event = new Event('storage');
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('فشل في إطلاق حدث التخزين:', e);
    }
    
    console.log("تم إجبار تحديث واجهة المستخدم:", timestamp);
    return true;
  } catch (e) {
    console.error("فشل في إجبار تحديث واجهة المستخدم:", e);
    return false;
  }
};

/**
 * إجبار تحديث البيانات والواجهة معًا
 */
export const forceFullUpdate = async (): Promise<boolean> => {
  try {
    // إضافة علامات تحديث قوية
    addForceRefreshMarkers();
    
    // تحديث الواجهة
    forceUIUpdate();
    
    // إطلاق حدث تحديث البيانات
    const dataEvent = new CustomEvent('force_data_refresh', { 
      detail: { timestamp: Date.now() } 
    });
    window.dispatchEvent(dataEvent);
    
    console.log("تم إجبار التحديث الكامل للبيانات والواجهة");
    return true;
  } catch (e) {
    console.error("فشل في إجبار التحديث الكامل:", e);
    return false;
  }
};

/**
 * تنظيف ذاكرة التخزين المؤقت لـ React Query
 */
export const clearReactQueryCache = (): void => {
  try {
    // محاولة الوصول إلى ذاكرة React Query مباشرة
    // هذا سيعمل فقط إذا تم استدعاء هذه الوظيفة داخل مكون يستخدم React Query
    const queryClient = (window as any).__REACT_QUERY_GLOBAL_CLIENT__;
    if (queryClient && typeof queryClient.clear === 'function') {
      queryClient.clear();
      console.log("تم مسح ذاكرة React Query بنجاح");
    } else {
      // بديل: تعيين علامة لمسح الذاكرة المؤقتة
      localStorage.setItem('clear_query_cache', Date.now().toString());
      console.log("تم تعيين علامة لمسح ذاكرة React Query");
    }
  } catch (e) {
    console.error("فشل في مسح ذاكرة React Query:", e);
  }
};

/**
 * استخدم هذه الوظيفة في أي مكان تريد ضمان رؤية آخر البيانات
 */
export const ensureLatestData = async (): Promise<void> => {
  clearReactQueryCache();
  await forceFullUpdate();
  
  // إضافة تأخير صغير للسماح للمكونات بإعادة التصيير
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('storage_changed'));
    window.dispatchEvent(new CustomEvent('app_data_updated'));
  }, 100);
};
