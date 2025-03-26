
/**
 * وظائف مساعدة لتنفيذ عمليات المزامنة
 * Helper functions for executing sync operations
 */

import { BLADI_INFO_SOURCES } from '../../remote/sync/sources';
import { syncWithBladiInfo } from '../../remote/sync/bladiInfoSync';

/**
 * تنفيذ المزامنة مع مصدر محدد أو مع جميع المصادر
 * Execute sync with a specific source or with all sources
 */
export const executeSync = async (
  availableSource: string | null, 
  forceRefresh: boolean,
  cacheBuster: string,
  skewParam: string | null
): Promise<boolean> => {
  try {
    console.log('تنفيذ المزامنة باستخدام منع التخزين المؤقت:', cacheBuster);
    
    // إذا كان هناك مصدر متاح، استخدمه
    if (availableSource) {
      console.log(`بدء المزامنة مع المصدر المتاح: ${availableSource}`);
      
      try {
        // استخدام وظيفة المزامنة مع Bladi Info
        const { syncWithRemoteSource } = await import('../../remote/sync/syncWithRemote');
        
        // إضافة منع التخزين المؤقت إلى URL
        const sourceWithCacheBuster = availableSource.includes('?') 
          ? `${availableSource}&${cacheBuster.substring(1)}` 
          : `${availableSource}${cacheBuster}`;
        
        // إضافة معلمة حماية التزامن إذا كانت متوفرة
        const finalUrl = skewParam 
          ? (sourceWithCacheBuster.includes('?') 
              ? `${sourceWithCacheBuster}&${skewParam}` 
              : `${sourceWithCacheBuster}?${skewParam}`)
          : sourceWithCacheBuster;
        
        const success = await syncWithRemoteSource(finalUrl, forceRefresh);
        
        if (success) {
          console.log('تمت المزامنة بنجاح مع المصدر المتاح');
          return true;
        } else {
          console.warn('فشلت المزامنة مع المصدر المتاح، جاري محاولة المزامنة مع جميع المصادر...');
        }
      } catch (error) {
        console.error(`فشلت المزامنة مع المصدر المتاح (${availableSource}):`, error);
      }
    }
    
    // إذا لم يكن هناك مصدر متاح أو فشلت المزامنة، حاول مع جميع المصادر
    console.log('محاولة المزامنة مع جميع مصادر Bladi Info...');
    
    const success = await syncWithBladiInfo(forceRefresh);
    
    if (success) {
      console.log('تمت المزامنة بنجاح مع أحد مصادر Bladi Info');
      return true;
    } else {
      console.warn('فشلت المزامنة مع جميع مصادر Bladi Info');
      return false;
    }
  } catch (error) {
    console.error('خطأ أثناء تنفيذ المزامنة:', error);
    return false;
  }
};
