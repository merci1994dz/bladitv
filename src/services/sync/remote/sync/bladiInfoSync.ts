
/**
 * Functionality for syncing with Bladi Info sources
 */

import { BLADI_INFO_SOURCES } from './sources';
import { syncWithRemoteSource } from './syncWithRemote';
import { checkBladiInfoAvailability } from './sourceAvailability';
import { syncWithSourceGroup, syncWithLocalFallback } from './multiSourceSync';

// Export for external use
export { checkBladiInfoAvailability };
export { syncWithRemoteSource };

/**
 * تنفيذ المزامنة مع Bladi Info - مع محاولات متعددة
 * Implement synchronization with Bladi Info - with multiple attempts
 */
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  // تحقق من توفر مصدر أولاً
  // Check for an available source first
  const availableSource = await checkBladiInfoAvailability();
  
  if (availableSource) {
    console.log(`استخدام المصدر المتاح: ${availableSource}`);
    
    try {
      const success = await syncWithRemoteSource(availableSource, forceRefresh);
      
      if (success) {
        console.log(`تمت المزامنة بنجاح مع ${availableSource}`);
        return true;
      } else {
        console.warn(`فشلت المزامنة مع المصدر المتاح، جاري تجربة مصادر أخرى...`);
      }
    } catch (error) {
      console.error(`فشلت المزامنة مع المصدر المتاح ${availableSource}:`, error);
    }
  } else {
    console.log('لم يتم العثور على مصدر متاح بعد، جاري فحص جميع المصادر...');
  }
  
  // إذا لم يكن هناك مصدر متاح أو فشل المصدر المتاح، جرب جميع المصادر
  // If there's no available source or it failed, try all sources
  console.log('محاولة الاتصال بجميع مصادر Bladi Info...');
  
  // تقسيم المصادر إلى مجموعات للتنفيذ المتوازي
  // Split sources into groups for parallel execution
  const batchSize = 3;
  const sourceGroups = [];
  
  for (let i = 0; i < BLADI_INFO_SOURCES.length; i += batchSize) {
    sourceGroups.push(BLADI_INFO_SOURCES.slice(i, i + batchSize));
  }
  
  // فحص كل مجموعة من المصادر
  // Check each group of sources
  for (const sourceGroup of sourceGroups) {
    const success = await syncWithSourceGroup(sourceGroup, forceRefresh);
    if (success) return true;
  }
  
  // محاولة استخدام المصدر المحلي كخيار أخير
  // Try using local source as a last resort
  const localSuccess = await syncWithLocalFallback(forceRefresh);
  if (localSuccess) return true;
  
  console.error('جميع روابط Bladi Info غير متاحة للوصول');
  return false;
};
