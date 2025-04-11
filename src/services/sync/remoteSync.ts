
/**
 * آلية المزامنة مع المصادر الخارجية
 * Synchronization mechanism with external sources
 */

import { channels, countries, categories, setIsSyncing } from '../dataStore';
import { fetchRemoteData } from './remote/fetch';
import { storeRemoteData } from './remote/storeData';
import { updateLastSyncTime } from './status/timestamp';
import { syncWithRemoteSource } from './remote/sync/syncWithRemote';
import { checkBladiInfoAvailability } from './remote/sync/sourceAvailability';

// Re-export these functions to make them available to other modules
export { checkBladiInfoAvailability };
export { syncWithRemoteSource };
export { getSkewProtectionParams } from './remote/fetch/skewProtection';

/**
 * المزامنة مع مواقع Bladi Info
 * Synchronize with Bladi Info websites
 * 
 * @param forceRefresh تجاهل التخزين المؤقت وفرض التحديث
 * @returns Promise<{ updated: boolean, channelsCount: number }>
 */
export const syncWithBladiInfo = async (
  forceRefresh = false, 
  options?: { preventDuplicates?: boolean }
): Promise<{ updated: boolean, channelsCount: number }> => {
  try {
    console.log('بدء المزامنة مع مواقع Bladi Info...');
    
    setIsSyncing(true);
    
    // محاولة الحصول على مصدر متاح
    const availableSource = await checkBladiInfoAvailability();
    
    if (!availableSource) {
      console.warn('لم يتم العثور على أي مصدر متاح للمزامنة');
      return { updated: false, channelsCount: 0 };
    }
    
    console.log(`مزامنة مع المصدر: ${availableSource}`);
    
    // تحضير رابط المصدر مع معلمات لمنع التخزين المؤقت
    const cacheBuster = forceRefresh ? 
      `?nocache=${Date.now()}&_=${Math.random().toString(36).substr(2, 9)}` : '';
    const targetUrl = availableSource + cacheBuster;
    
    // جلب البيانات من المصدر
    const data = await fetchRemoteData(targetUrl);
    
    if (!data || !data.channels || !Array.isArray(data.channels)) {
      console.error('بيانات غير صالحة تم استلامها من المصدر');
      return { updated: false, channelsCount: 0 };
    }
    
    // حساب القنوات قبل التحديث
    const channelsCountBefore = channels.length;
    
    // استخدام خيار منع التكرار دائمًا لتجنب القنوات المكررة
    const usePreventDuplicates = options?.preventDuplicates !== false; // افتراضيًا true إلا إذا تم تعيينه صراحةً على false
    
    // تخزين البيانات المستلمة مع منع القنوات المكررة
    await storeRemoteData(data, availableSource, { preventDuplicates: usePreventDuplicates });
    
    // حساب القنوات بعد التحديث
    const channelsCountAfter = channels.length;
    const channelsDiff = channelsCountAfter - channelsCountBefore;
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    
    console.log(`تمت المزامنة بنجاح مع مواقع Bladi Info. تم إضافة ${channelsDiff} قناة جديدة.`);
    
    // إرجاع حالة التحديث وعدد القنوات
    return {
      updated: channelsDiff > 0,
      channelsCount: channelsDiff
    };
  } catch (error) {
    console.error('خطأ في المزامنة مع مواقع Bladi Info:', error);
    return { updated: false, channelsCount: 0 };
  } finally {
    setIsSyncing(false);
  }
};

