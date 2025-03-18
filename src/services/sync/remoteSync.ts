
import { channels, countries, categories, setIsSyncing } from '../dataStore';
import { fetchRemoteData } from './remote/fetch';
import { storeRemoteData } from './remote/storeData';
import { updateLastSyncTime } from './config';
import { checkBladiInfoAvailability } from './remote/syncOperations';

/**
 * المزامنة مع مواقع Bladi Info
 * Synchronize with Bladi Info websites
 * 
 * @param forceRefresh تجاهل التخزين المؤقت وفرض التحديث
 * @returns Promise<boolean | { updated: boolean, channelsCount: number }>
 */
export const syncWithBladiInfo = async (
  forceRefresh = false, 
  options?: { preventDuplicates?: boolean }
): Promise<boolean | { updated: boolean, channelsCount: number }> => {
  try {
    console.log('بدء المزامنة مع مواقع Bladi Info...');
    
    setIsSyncing(true);
    
    // محاولة الحصول على مصدر متاح
    const availableSource = await checkBladiInfoAvailability();
    
    if (!availableSource) {
      console.warn('لم يتم العثور على أي مصدر متاح للمزامنة');
      return false;
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
      return false;
    }
    
    // حساب القنوات قبل التحديث
    const channelsCountBefore = channels.length;
    
    // تخزين البيانات المستلمة مع منع القنوات المكررة إذا تم طلب ذلك
    await storeRemoteData(data, availableSource, { preventDuplicates: options?.preventDuplicates });
    
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
    return false;
  } finally {
    setIsSyncing(false);
  }
};
