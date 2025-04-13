
/**
 * مزامنة مع مصادر Bladi Info
 * Sync with Bladi Info sources
 */

import { fetchRemoteData } from '../fetch/fetchRemoteData';
import { storeRemoteData } from '../storeData';
import { BLADI_INFO_SOURCES } from './sources';
import { updateLastSyncTime } from '../../status/timestamp';
import { channels } from '../../../dataStore';

/**
 * مزامنة مع مصدر Bladi Info محدد
 * Sync with a specific Bladi Info source
 */
export const syncWithBladiInfo = async (
  forceRefresh = false,
  options?: { preventDuplicates?: boolean }
): Promise<{ updated: boolean, channelsCount: number }> => {
  try {
    // البحث عن مصدر متاح
    // Find an available source
    let availableSource = '';
    
    for (const source of BLADI_INFO_SOURCES) {
      try {
        // إضافة معلمات لمنع التخزين المؤقت إذا كان التحديث إجباريًا
        // Add parameters to prevent caching if force refresh is enabled
        const cacheBuster = forceRefresh ? 
          `?nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 9)}` : '';
        
        const sourceUrl = source + cacheBuster;
        const data = await fetchRemoteData(sourceUrl);
        
        // التحقق من صحة البيانات
        // Verify data validity
        if (data && data.channels && Array.isArray(data.channels)) {
          availableSource = source;
          
          // حساب عدد القنوات قبل التحديث
          // Count channels before update
          const channelsCountBefore = channels.length;
          
          // حفظ البيانات
          // Store data
          const usePreventDuplicates = options?.preventDuplicates !== false;
          await storeRemoteData(data, source, { preventDuplicates: usePreventDuplicates });
          
          // حساب عدد القنوات الجديدة
          // Count new channels
          const channelsCountAfter = channels.length;
          const channelsDiff = channelsCountAfter - channelsCountBefore;
          
          // تحديث وقت آخر مزامنة
          // Update last sync time
          updateLastSyncTime();
          
          return {
            updated: channelsDiff > 0,
            channelsCount: channelsDiff
          };
        }
      } catch (error) {
        console.warn(`فشل الاتصال بالمصدر ${source}:`, error);
        // متابعة المحاولة مع المصدر التالي
        // Continue trying with the next source
      }
    }
    
    // لم يتم العثور على أي مصدر متاح
    // No available source found
    return { updated: false, channelsCount: 0 };
  } catch (error) {
    console.error('خطأ في مزامنة Bladi Info:', error);
    return { updated: false, channelsCount: 0 };
  }
};
