
/**
 * وظيفة لتنفيذ المزامنة مع معالجة الأخطاء المحسنة
 * Function to execute synchronization with improved error handling
 */

import { syncWithRemoteSource } from '../../remote/sync/syncWithRemote';
import { delay, calculateAdaptiveWaitTime } from './timeoutHelper';
import { BLADI_INFO_SOURCES } from '../../remote/sync/sources';

// لتتبع محاولات المزامنة لكل مصدر
// For tracking sync attempts for each source
const sourceAttemptMap = new Map<string, number>();

// الحد الأقصى لمحاولات المزامنة لكل مصدر
// Maximum sync attempts per source
const MAX_SOURCE_ATTEMPTS = 2;

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
        // إعادة تعيين المحاولات الناجحة
        sourceAttemptMap.clear();
        return true;
      }
    } catch (error) {
      console.warn(`فشلت المزامنة مع المصدر الرئيسي: ${primarySource}`, error);
      // زيادة عدد محاولات هذا المصدر
      const attempts = (sourceAttemptMap.get(primarySource) || 0) + 1;
      sourceAttemptMap.set(primarySource, attempts);
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
    // تخطي المصادر التي تجاوزت الحد الأقصى للمحاولات
    const sourceAttempts = sourceAttemptMap.get(source) || 0;
    if (sourceAttempts >= MAX_SOURCE_ATTEMPTS) {
      console.log(`تخطي المصدر ${source} لأنه تجاوز الحد الأقصى للمحاولات (${MAX_SOURCE_ATTEMPTS})`);
      continue;
    }
    
    try {
      console.log(`محاولة المزامنة مع مصدر احتياطي: ${source}`);
      const result = await syncWithRemoteSource(source, forceRefresh);
      
      if (result) {
        console.log(`نجحت المزامنة مع المصدر الاحتياطي: ${source}`);
        // إعادة تعيين المحاولات الناجحة
        sourceAttemptMap.clear();
        return true;
      }
      
      // زيادة عدد محاولات هذا المصدر
      sourceAttemptMap.set(source, sourceAttempts + 1);
      
      // تأخير بين المحاولات لتجنب إغراق الخادم - استخدام وقت انتظار متكيف
      // Delay between attempts to avoid flooding the server - using adaptive wait time
      const waitTime = calculateAdaptiveWaitTime(sourceAttempts + 1, 1000, 3000);
      console.log(`انتظار ${waitTime}ms قبل المصدر الاحتياطي التالي`);
      await delay(waitTime);
    } catch (error) {
      console.warn(`فشلت المزامنة مع المصدر الاحتياطي: ${source}`, error);
      // زيادة عدد محاولات هذا المصدر
      sourceAttemptMap.set(source, sourceAttempts + 1);
    }
  }
  
  // عند فشل جميع المصادر، قم بإعادة تعيين خريطة المحاولات
  // تتيح ذلك محاولة مرة أخرى في المستقبل مع كل المصادر
  if (sourceAttemptMap.size > backupSources.length / 2) {
    console.log('إعادة تعيين محاولات المصادر بعد فشل معظم المصادر');
    sourceAttemptMap.clear();
  }
  
  console.warn('فشلت جميع محاولات المزامنة');
  return false;
};
