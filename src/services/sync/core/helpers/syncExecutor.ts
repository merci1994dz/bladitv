
/**
 * دالة لتنفيذ المزامنة مع المصادر المختلفة
 * Function to execute sync with different sources
 */

import { getRemoteConfig } from '../../remote';
import { REMOTE_CONFIG } from '../../../config';
import { syncWithRemoteSource, syncWithBladiInfo } from '../../remoteSync';
import { syncWithLocalData } from '../../local';
import { BLADI_INFO_SOURCES } from '../../remote/sync/sources';

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
    // إضافة علامة تأكيد للتحديث
    forceRefresh = true; // دائمًا استخدم forceRefresh=true
    
    // تجاوز المصادر المحلية إذا كانت متاحة
    if (availableSource && availableSource.startsWith('/')) {
      console.log('تجاوز المصدر المحلي المتاح، محاولة العثور على مصدر خارجي');
      availableSource = null;
    }
    
    // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
    // Try to sync with available source directly if found
    if (availableSource && !availableSource.startsWith('/')) {
      try {
        console.log(`محاولة المزامنة مع المصدر المتاح: / Attempting to sync with available source: ${availableSource}`);
        // إضافة معامل منع التخزين المؤقت للرابط
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const cacheBuster = `?_=${timestamp}&nocache=${randomId}`;
        const urlWithCacheBuster = availableSource.includes('?') 
          ? `${availableSource.split('?')[0]}${cacheBuster}&${availableSource.split('?')[1]}` 
          : `${availableSource}${fullCacheBuster}`;
          
        const directResult = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        if (directResult) {
          console.log(`تمت المزامنة بنجاح مع المصدر المتاح: / Successfully synced with available source: ${availableSource}`);
          return true;
        }
        console.warn(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}`);
      } catch (error) {
        console.error(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}:`, error);
      }
    }
    
    // محاولة المزامنة مع مصادر Bladi Info (باستثناء المصادر المحلية)
    // Try to sync with Bladi Info sources (excluding local sources)
    console.log('محاولة المزامنة مع مصادر Bladi Info الخارجية... / Attempting to sync with external Bladi Info sources...');
    
    // تصفية المصادر المحلية
    const externalSources = BLADI_INFO_SOURCES.filter(source => !source.startsWith('/'));
    
    // تقسيم المصادر إلى مجموعات للتنفيذ المتوازي
    const batchSize = 3;
    const sourceGroups = [];
    
    for (let i = 0; i < externalSources.length; i += batchSize) {
      sourceGroups.push(externalSources.slice(i, i + batchSize));
    }
    
    // محاولة مزامنة كل مجموعة بالتتابع
    for (const group of sourceGroups) {
      const syncPromises = group.map(async (source) => {
        try {
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          const cacheBuster = `?_=${timestamp}&nocache=${randomId}`;
          const urlWithCacheBuster = source.includes('?') 
            ? `${source.split('?')[0]}${cacheBuster}&${source.split('?')[1]}` 
            : `${source}${cacheBuster}`;
            
          return await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        } catch (e) {
          console.error(`فشلت المزامنة مع ${source}:`, e);
          return false;
        }
      });
      
      const results = await Promise.all(syncPromises);
      if (results.some(result => result === true)) {
        console.log('تمت المزامنة بنجاح مع أحد مصادر Bladi Info / Successfully synced with one of the Bladi Info sources');
        return true;
      }
    }
    
    // محاولة استخدام المزامنة مع Bladi Info كمجموعة
    console.log('محاولة استخدام مزامنة Bladi Info... / Attempting to use Bladi Info sync...');
    const bladiInfoResult = await syncWithBladiInfo(forceRefresh);
    if (bladiInfoResult) {
      console.log('تمت المزامنة بنجاح مع مصادر Bladi Info / Successfully synced with Bladi Info sources');
      return true;
    }
    console.warn('فشلت المزامنة مع جميع مصادر Bladi Info / Failed to sync with all Bladi Info sources');
    
    // التحقق من وجود تكوين خارجي
    // Check for external configuration
    const remoteConfig = getRemoteConfig();
    if (REMOTE_CONFIG.ENABLED && remoteConfig && remoteConfig.url && !remoteConfig.url.startsWith('/')) {
      try {
        console.log(`محاولة المزامنة مع المصدر المحفوظ: / Attempting to sync with saved source: ${remoteConfig.url}`);
        // إضافة معامل كسر التخزين المؤقت للرابط مع دعم حماية التزامن
        // Add cache-busting parameter to URL with sync protection support
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const cacheBuster = `?_=${timestamp}&nocache=${randomId}`;
        const urlWithCacheBuster = remoteConfig.url.includes('?') 
          ? `${remoteConfig.url.split('?')[0]}${cacheBuster}&${remoteConfig.url.split('?')[1]}${skewParam ? `&${skewParam}` : ''}` 
          : `${remoteConfig.url}${fullCacheBuster}`;
          
        const result = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        if (result) {
          return true;
        }
      } catch (error) {
        console.error('خطأ في المزامنة مع المصدر الخارجي المحفوظ: / Error syncing with saved external source:', error);
      }
    }
    
    // عدم استخدام البيانات المحلية حسب طلب المستخدم
    console.log('فشلت المزامنة مع المصادر الخارجية / Failed to sync with external sources');
    return false;
  } catch (error) {
    console.error('خطأ أثناء المزامنة: / Error during sync:', error);
    return false;
  }
}
