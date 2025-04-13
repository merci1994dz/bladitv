
/**
 * وظائف مساعدة للمزامنة مع مصادر متعددة
 * Helper functions for syncing with multiple sources
 */

import { syncWithRemoteSource } from './syncWithRemote';

/**
 * مزامنة مع مجموعة من المصادر
 * Sync with a group of sources
 */
export const syncWithSourceGroup = async (
  sources: string[],
  forceRefresh: boolean
): Promise<boolean> => {
  // إنشاء مصفوفة من وعود المزامنة للتنفيذ المتوازي
  // Create an array of sync promises for parallel execution
  const syncPromises = sources.map(source => {
    return syncWithRemoteSource(source, forceRefresh)
      .catch(() => false);
  });
  
  // انتظار جميع الوعود وفحص النتائج
  // Wait for all promises and check results
  const results = await Promise.all(syncPromises);
  
  // إرجاع true إذا نجحت أي عملية مزامنة واحدة على الأقل
  // Return true if at least one sync operation succeeded
  return results.some(result => result === true);
};

/**
 * مزامنة مع المصدر المحلي كخيار أخير
 * Sync with local source as a last resort
 */
export const syncWithLocalFallback = async (forceRefresh: boolean): Promise<boolean> => {
  try {
    console.log('محاولة استخدام المصدر المحلي...');
    const localSource = '/data/channels.json';
    
    const success = await syncWithRemoteSource(localSource, forceRefresh);
    
    if (success) {
      console.log('تمت المزامنة بنجاح مع المصدر المحلي');
      return true;
    } else {
      console.warn('فشلت المزامنة مع المصدر المحلي');
      return false;
    }
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر المحلي:', error);
    return false;
  }
};
