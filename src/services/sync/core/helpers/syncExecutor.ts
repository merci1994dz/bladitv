
/**
 * دالة لتنفيذ المزامنة مع المصادر المختلفة
 * Function to execute sync with different sources
 */

import { getRemoteConfig } from '../../remote';
import { REMOTE_CONFIG } from '../../../config';
import { syncWithRemoteSource, syncWithBladiInfo } from '../../remoteSync';
import { syncWithLocalData } from '../../local';

/**
 * تنفيذ المزامنة مع مصادر مختلفة
 * Execute sync with different sources
 * 
 * @param availableSource المصدر المتاح المكتشف / Available discovered source
 * @param forceRefresh إجبار التحديث / Force refresh
 * @param fullCacheBuster معامل كسر التخزين المؤقت / Cache busting parameter
 * @param skewParam معامل حماية التزامن / Sync protection parameter
 * @returns وعد بنجاح أو فشل المزامنة / Promise with sync success or failure
 */
export async function executeSync(
  availableSource: string | null, 
  forceRefresh: boolean,
  fullCacheBuster: string,
  skewParam: string | null
): Promise<boolean> {
  try {
    // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
    // Try to sync with available source directly if found
    if (availableSource) {
      try {
        console.log(`محاولة المزامنة مع المصدر المتاح: / Attempting to sync with available source: ${availableSource}`);
        const directResult = await syncWithRemoteSource(availableSource, forceRefresh);
        if (directResult) {
          console.log(`تمت المزامنة بنجاح مع المصدر المتاح: / Successfully synced with available source: ${availableSource}`);
          return true;
        }
        console.warn(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}`);
      } catch (error) {
        console.error(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}:`, error);
      }
    }
    
    // محاولة المزامنة مع جميع مصادر Bladi Info
    // Try to sync with all Bladi Info sources
    console.log('محاولة المزامنة مع جميع مصادر Bladi Info... / Attempting to sync with all Bladi Info sources...');
    const bladiInfoResult = await syncWithBladiInfo(forceRefresh);
    if (bladiInfoResult) {
      console.log('تمت المزامنة بنجاح مع مصادر Bladi Info / Successfully synced with Bladi Info sources');
      return true;
    }
    console.warn('فشلت المزامنة مع جميع مصادر Bladi Info / Failed to sync with all Bladi Info sources');
    
    // التحقق من وجود تكوين خارجي
    // Check for external configuration
    const remoteConfig = getRemoteConfig();
    if (REMOTE_CONFIG.ENABLED && remoteConfig && remoteConfig.url) {
      try {
        console.log(`محاولة المزامنة مع المصدر المحفوظ: / Attempting to sync with saved source: ${remoteConfig.url}`);
        // إضافة معامل كسر التخزين المؤقت للرابط مع دعم حماية التزامن
        // Add cache-busting parameter to URL with sync protection support
        const urlWithCacheBuster = remoteConfig.url.includes('?') 
          ? `${remoteConfig.url}&_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}${skewParam ? `&${skewParam}` : ''}` 
          : `${remoteConfig.url}${fullCacheBuster}`;
          
        const result = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        return result;
      } catch (error) {
        console.error('خطأ في المزامنة مع المصدر الخارجي المحفوظ: / Error syncing with saved external source:', error);
      }
    }
    
    // استخدام البيانات المحلية كحل أخير
    // Use local data as last resort
    console.log('فشلت المزامنة مع المصادر الخارجية، استخدام البيانات المحلية / Failed to sync with external sources, using local data');
    const result = await syncWithLocalData(forceRefresh);
    return result;
  } catch (error) {
    console.error('خطأ أثناء المزامنة: / Error during sync:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الفشل
    // Try to use local data in case of failure
    try {
      console.log('محاولة استخدام البيانات المحلية بعد فشل المزامنة الخارجية / Attempting to use local data after external sync failure');
      return await syncWithLocalData(false);
    } catch (localError) {
      console.error('فشل في استخدام البيانات المحلية: / Failed to use local data:', localError);
      return false;
    }
  }
}

