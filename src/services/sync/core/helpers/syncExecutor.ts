
/**
 * منفذ المزامنة
 * Sync executor
 */

import { syncWithRemoteSource } from '../../remote/sync/syncWithRemote';

/**
 * تنفيذ عملية المزامنة باستخدام المصدر المتاح
 * Execute sync operation using available source
 * 
 * @param source المصدر المتاح
 * @param forceRefresh إجبار التحديث
 * @param cacheBuster كاسر التخزين المؤقت (اختياري)
 * @param timeoutPromise وعد المهلة (اختياري)
 * @returns نتيجة المزامنة
 */
export const executeSync = async (
  source: string | null,
  forceRefresh: boolean,
  cacheBuster?: string,
  timeoutPromise?: Promise<boolean>
): Promise<boolean> => {
  try {
    if (source) {
      // المزامنة مع مصدر محدد
      // Sync with specific source
      
      // السماح بمصادر محلية للتطوير
      // Allow local sources for development
      const isLocalSource = source.startsWith('/');
      
      if (isLocalSource) {
        console.log('استخدام مصدر محلي للمزامنة:', source);
        try {
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              // هنا يمكن إضافة معالجة البيانات المحلية
              console.log('تم جلب البيانات المحلية بنجاح من:', source);
              return true;
            }
          }
        } catch (localError) {
          console.error('خطأ في جلب المصدر المحلي:', localError);
        }
      } else {
        // مصدر خارجي - نستخدم syncWithRemoteSource مع المعلمات المطلوبة فقط
        return await syncWithRemoteSource(source, forceRefresh);
      }
    }
    
    // لم يتم تحديد مصدر أو فشل المصدر المحدد
    // No source specified or source failed
    console.warn('لم يتم تحديد مصدر للمزامنة أو فشل المصدر المحدد');
    return false;
  } catch (error) {
    console.error('خطأ في تنفيذ المزامنة:', error);
    return false;
  }
};
