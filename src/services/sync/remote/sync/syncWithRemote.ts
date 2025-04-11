
/**
 * المزامنة مع المصدر البعيد
 * Sync with remote source
 */

import { fetchWithTimeout } from '../fetch';
import { storeRemoteData } from '../storeData';
import { handleError } from '@/utils/errorHandling';

interface SyncOptions {
  preventDuplicates?: boolean;
  timeout?: number;
}

/**
 * مزامنة البيانات مع مصدر خارجي
 * Synchronize data with external source
 * 
 * @param remoteUrl عنوان URL للمصدر الخارجي / URL of the external source
 * @param forceRefresh ما إذا كان يجب تجاهل التخزين المؤقت وإجبار التحديث / Whether to ignore cache and force a refresh
 * @param options خيارات إضافية للمزامنة / Additional sync options
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المزامنة / Promise resolving to boolean indicating sync success
 */
export const syncWithRemoteSource = async (
  remoteUrl: string, 
  forceRefresh: boolean = false,
  options: SyncOptions = {}
): Promise<boolean> => {
  try {
    console.log(`بدء المزامنة مع المصدر الخارجي: ${remoteUrl}`);
    
    // إضافة معلمات لمنع التخزين المؤقت
    const urlObj = new URL(remoteUrl);
    if (forceRefresh) {
      urlObj.searchParams.append('_nocache', Date.now().toString());
      urlObj.searchParams.append('_force', 'true');
    }
    
    // تعيين زمن انتهاء المهلة
    const timeout = options.timeout || 10000; // 10 ثوانٍ افتراضيًا
    
    // استخدام وظيفة الجلب مع مهلة زمنية
    const response = await fetchWithTimeout(urlObj.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': forceRefresh ? 'no-cache, no-store' : 'default'
      }
    }, timeout);
    
    if (!response.ok) {
      console.error(`فشل في جلب البيانات من ${remoteUrl}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    // تحويل البيانات إلى JSON
    const data = await response.json();
    
    if (!data) {
      console.error(`لم يتم استلام بيانات صالحة من ${remoteUrl}`);
      return false;
    }
    
    console.log(`تم استلام استجابة من ${remoteUrl}، جاري معالجة البيانات...`);
    
    // تحديث البيانات المحلية مع التحقق من التكرار إذا تم طلب ذلك
    const preventDuplicates = options.preventDuplicates === true;
    const result = await storeRemoteData(data, remoteUrl, { preventDuplicates });
    
    if (result) {
      console.log(`تمت المزامنة بنجاح مع ${remoteUrl}`);
    } else {
      console.warn(`فشلت المزامنة مع ${remoteUrl}`);
    }
    
    return result;
  } catch (error) {
    console.error(`خطأ أثناء المزامنة مع ${remoteUrl}:`, error);
    
    // استخدام وظيفة معالجة الأخطاء العامة
    handleError(error, `المزامنة مع المصدر الخارجي: ${remoteUrl}`);
    
    return false;
  }
};
