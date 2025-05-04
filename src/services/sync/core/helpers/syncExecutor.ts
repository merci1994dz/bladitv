
/**
 * منفذ المزامنة
 * Sync executor
 */

import { syncWithRemoteSource } from '../../remote/sync/syncWithRemote';
import { checkConnectionFromError } from '../../status/errorHandling';
import { checkConnectivityIssues } from '../../status/connectivity';

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
    if (!source) {
      console.warn('لم يتم تحديد مصدر للمزامنة');
      return false;
    }
    
    // تحسين: تحديد ما إذا كان المصدر محليًا
    const isLocalSource = source.startsWith('/');
    
    if (isLocalSource) {
      console.log('استخدام مصدر محلي للمزامنة:', source);
      try {
        // تحسين: زيادة مهلة الانتظار للمصادر المحلية
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(source, { 
          signal: controller.signal,
          cache: 'no-store' // تحسين: منع التخزين المؤقت للحصول على أحدث البيانات
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            console.log('تم جلب البيانات المحلية بنجاح من:', source);
            return true;
          }
        }
        return false;
      } catch (localError) {
        console.error('خطأ في جلب المصدر المحلي:', localError);
        return false;
      }
    }
    
    // مصدر خارجي - استخدام syncWithRemoteSource
    // تحسين: تمرير المعلمات المطلوبة فقط
    return await syncWithRemoteSource(source, forceRefresh);
  } catch (error) {
    console.error('خطأ في تنفيذ المزامنة:', error);
    // التحقق من مشاكل الاتصال
    checkConnectionFromError(error);
    return false;
  }
};
