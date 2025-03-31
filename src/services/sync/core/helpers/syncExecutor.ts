
/**
 * منفذ المزامنة
 * Sync executor
 */

import { syncWithRemoteSource } from '../../remote/sync';

/**
 * تنفيذ عملية المزامنة باستخدام المصدر المتاح
 * Execute sync operation using available source
 * 
 * @param source المصدر المتاح
 * @param forceRefresh إجبار التحديث
 * @param cacheBuster كاسر التخزين المؤقت
 * @param timeoutPromise وعد المهلة
 * @returns نتيجة المزامنة
 */
export const executeSync = async (
  source: string | null,
  forceRefresh: boolean,
  cacheBuster: string,
  timeoutPromise?: Promise<boolean>
): Promise<boolean> => {
  try {
    if (source) {
      // المزامنة مع مصدر محدد
      // Sync with specific source
      return await syncWithRemoteSource(source, forceRefresh, cacheBuster);
    }
    
    // لم يتم تحديد مصدر
    // No source specified
    console.warn('لم يتم تحديد مصدر للمزامنة');
    return false;
  } catch (error) {
    console.error('خطأ في تنفيذ المزامنة:', error);
    return false;
  }
};
