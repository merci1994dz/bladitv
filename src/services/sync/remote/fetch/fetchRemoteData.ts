
/**
 * وظيفة محسنة لجلب البيانات من مصادر خارجية
 * Optimized function for fetching data from external sources
 */

import { validateRemoteData } from '../../remoteValidation';
import { fetchLocalFile } from './localFetch';
import { tryJsonpStrategy, tryProxyStrategy, tryDirectFetchStrategy } from './fetchStrategies';
import { exponentialBackoff } from './retryStrategies';
import { enhanceFetchError } from './errorHandling';

/**
 * جلب البيانات من مصدر خارجي مع آليات متعددة للمحاولة
 * Fetch data from an external source with multiple retry mechanisms
 * 
 * @param remoteUrl رابط المصدر الخارجي / URL of the external source
 * @returns وعد بالبيانات المجلوبة / Promise with the fetched data
 */
export const fetchRemoteData = async (remoteUrl: string): Promise<any> => {
  // التعامل مع المصادر المحلية
  if (remoteUrl.startsWith('/')) {
    return fetchLocalFile(remoteUrl);
  }
  
  // إعداد مراقبة الوقت
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // مهلة 60 ثانية
  
  try {
    console.log(`جاري تحميل البيانات من: ${remoteUrl}`);
    
    // إعداد محاولات متعددة
    const MAX_RETRIES = 8;
    let retries = MAX_RETRIES;
    let lastError;
    
    while (retries > 0) {
      try {
        let data;
        
        // استخدام استراتيجيات مختلفة حسب عدد المحاولات المتبقية
        if (retries <= 5) {
          // في المحاولات الأخيرة، محاولة استخدام JSONP
          try {
            data = await tryJsonpStrategy(remoteUrl);
            clearTimeout(timeoutId);
            break; // نجحت المحاولة، الخروج من الحلقة
          } catch (jsonpError) {
            console.warn('فشلت محاولة JSONP، المتابعة باستراتيجيات أخرى');
          }
        }
        
        if (retries <= 3) {
          // محاولة استخدام بروكسي CORS
          try {
            data = await tryProxyStrategy(remoteUrl, controller.signal);
            clearTimeout(timeoutId);
            break; // نجحت المحاولة، الخروج من الحلقة
          } catch (proxyError) {
            console.warn('فشلت محاولات البروكسي، المتابعة بالمحاولة المباشرة');
          }
        }
        
        // محاولة الطلب المباشر كآخر خيار أو كخيار أول في المحاولات الأولى
        data = await tryDirectFetchStrategy(remoteUrl, retries, controller.signal);
        
        // التحقق من صحة البيانات
        if (!validateRemoteData(data)) {
          throw new Error('البيانات المستلمة غير صالحة أو لا تتطابق مع الهيكل المتوقع');
        }
        
        clearTimeout(timeoutId);
        
        // إضافة علامة لتأكيد تحديث البيانات
        try {
          localStorage.setItem('force_browser_refresh', 'true');
          localStorage.setItem('nocache_version', Date.now().toString());
          localStorage.setItem('data_version', Date.now().toString());
        } catch (e) {
          // تجاهل أخطاء التخزين المحلي
        }
        
        return data;
      } catch (error) {
        console.warn(`فشلت المحاولة ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} للاتصال بـ ${remoteUrl}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // الانتظار قبل المحاولة التالية مع زيادة وقت الانتظار
          await exponentialBackoff(MAX_RETRIES - retries);
        }
      }
    }
    
    // إذا فشلت جميع المحاولات
    clearTimeout(timeoutId);
    throw lastError || new Error('فشلت جميع محاولات الاتصال بالمصدر الخارجي');
    
  } catch (error) {
    clearTimeout(timeoutId);
    throw enhanceFetchError(error);
  }
};
