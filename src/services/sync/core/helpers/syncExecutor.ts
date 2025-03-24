
/**
 * وظيفة لتنفيذ المزامنة مع معالجة الأخطاء المحسنة
 * Function to execute synchronization with improved error handling
 */

import { syncWithRemoteSource } from '../../remote/sync/syncWithRemote';
import { delay } from './timeoutHelper';
import { BLADI_INFO_SOURCES } from '../../remote/sync/sources';

/**
 * تنفيذ المزامنة مع مصدر محدد أو مع جميع المصادر
 * Execute synchronization with a specific source or with all sources
 */
export const executeSync = async (
  primarySource: string | null,
  forceRefresh: boolean,
  cacheBuster: string,
  skewParam: string | null
): Promise<boolean> => {
  // أولاً، محاولة المزامنة مع المصدر الرئيسي إذا كان متاحًا
  // First, try to sync with the primary source if available
  if (primarySource) {
    try {
      console.log(`محاولة المزامنة مع المصدر الرئيسي: ${primarySource}`);
      const result = await syncWithRemoteSource(primarySource, forceRefresh);
      
      if (result) {
        console.log('نجحت المزامنة مع المصدر الرئيسي');
        return true;
      }
    } catch (error) {
      console.warn(`فشلت المزامنة مع المصدر الرئيسي: ${primarySource}`, error);
    }
  }
  
  // إذا فشل المصدر الرئيسي، جرب المصادر الاحتياطية
  // If primary source failed, try backup sources
  console.log('محاولة المزامنة مع المصادر الاحتياطية');
  
  // تصفية المصدر الرئيسي من قائمة المصادر للتجنب تكرار المحاولة
  // Filter out the primary source from the list of sources to avoid retrying
  const backupSources = BLADI_INFO_SOURCES.filter(
    source => source !== primarySource && !source.startsWith('/')
  );
  
  // محاولة المزامنة مع كل مصدر احتياطي، مع تأخير بين المحاولات
  // Try synchronizing with each backup source, with delay between attempts
  for (const source of backupSources) {
    try {
      console.log(`محاولة المزامنة مع مصدر احتياطي: ${source}`);
      const result = await syncWithRemoteSource(source, forceRefresh);
      
      if (result) {
        console.log(`نجحت المزامنة مع المصدر الاحتياطي: ${source}`);
        return true;
      }
      
      // تأخير بين المحاولات لتجنب إغراق الخادم
      // Delay between attempts to avoid flooding the server
      await delay(1000);
    } catch (error) {
      console.warn(`فشلت المزامنة مع المصدر الاحتياطي: ${source}`, error);
    }
  }
  
  console.warn('فشلت جميع محاولات المزامنة');
  return false;
};
