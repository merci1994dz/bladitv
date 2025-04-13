
/**
 * مزامنة مع مصادر البيانات الخارجية
 * Sync with external data sources
 */

import { fetchRemoteData } from '../fetch/fetchRemoteData';
import { storeRemoteData } from '../storeData';
import { updateLastSyncTime } from '../../status/timestamp';
import { setIsSyncing } from '../../../dataStore';

/**
 * مزامنة مع مصدر بيانات خارجي
 * Sync with external data source
 * 
 * @param source رابط مصدر البيانات / Data source URL
 * @param forceRefresh تجاهل التخزين المؤقت وفرض التحديث / Ignore cache and force refresh
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المزامنة / Promise resolving to boolean indicating sync success
 */
export const syncWithRemoteSource = async (
  source: string,
  forceRefresh = false
): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر: ${source}`);
    setIsSyncing(true);
    
    // إضافة معلمات لمنع التخزين المؤقت إذا كان التحديث إجباريًا
    // Add parameters to prevent caching if force refresh is enabled
    const cacheBuster = forceRefresh ? 
      `?nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 9)}` : '';
    
    const targetUrl = source + cacheBuster;
    
    // جلب البيانات من المصدر
    // Fetch data from source
    const data = await fetchRemoteData(targetUrl);
    
    if (!data || !data.channels || !Array.isArray(data.channels)) {
      console.error('بيانات غير صالحة تم استلامها من المصدر');
      return false;
    }
    
    // تخزين البيانات
    // Store data
    await storeRemoteData(data, source);
    
    // تحديث وقت آخر مزامنة
    // Update last sync time
    updateLastSyncTime();
    
    console.log(`تمت المزامنة بنجاح مع المصدر: ${source}`);
    return true;
  } catch (error) {
    console.error(`خطأ في المزامنة مع المصدر ${source}:`, error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
