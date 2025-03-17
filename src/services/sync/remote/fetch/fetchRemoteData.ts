
/**
 * وظيفة محسنة لجلب البيانات من مصادر خارجية
 * Optimized function for fetching data from external sources
 */

import { validateRemoteData } from '../../remoteValidation';
import { fetchLocalFile } from './localFetch';
import { tryJsonpStrategy, tryProxyStrategy, tryDirectFetchStrategy } from './fetchStrategies';
import { exponentialBackoff, addCacheBusterToUrl } from './retryStrategies';
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
  
  // ضمان وجود معلمات منع التخزين المؤقت في الرابط
  const urlWithCacheBuster = addCacheBusterToUrl(remoteUrl);
  
  // إعداد مراقبة الوقت
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // مهلة 30 ثانية كحد أقصى
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCacheBuster}`);
    
    // إعداد محاولات متعددة
    const MAX_RETRIES = 5;
    let retries = MAX_RETRIES;
    let lastError;
    
    while (retries > 0) {
      try {
        let data;
        
        // استخدام الوسيلة المناسبة حسب عدد المحاولات
        if (retries <= 2) {
          // محاولة استخدام بروكسي CORS
          try {
            data = await tryProxyStrategy(urlWithCacheBuster, controller.signal);
            console.log('نجحت محاولة البروكسي');
            clearTimeout(timeoutId);
            
            // التحقق من صحة البيانات
            if (validateRemoteData(data)) {
              return data;
            }
            throw new Error('البيانات المستلمة من البروكسي غير صالحة');
          } catch (proxyError) {
            console.warn('فشلت محاولات البروكسي، المتابعة بالمحاولة المباشرة');
          }
        }
        
        if (retries <= 3) {
          // محاولة استخدام JSONP
          try {
            data = await tryJsonpStrategy(urlWithCacheBuster);
            console.log('نجحت محاولة JSONP');
            clearTimeout(timeoutId);
            
            // التحقق من صحة البيانات
            if (validateRemoteData(data)) {
              return data;
            }
            throw new Error('البيانات المستلمة من JSONP غير صالحة');
          } catch (jsonpError) {
            console.warn('فشلت محاولة JSONP، المتابعة باستراتيجيات أخرى');
          }
        }
        
        // محاولة الطلب المباشر كخيار أول أو أخير
        data = await tryDirectFetchStrategy(
          urlWithCacheBuster, 
          retries, 
          controller.signal
        );
        
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
          localStorage.setItem('cache_bust_time', Date.now().toString());
        } catch (e) {
          // تجاهل أخطاء التخزين المحلي
        }
        
        return data;
      } catch (error) {
        console.warn(`فشلت المحاولة ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} للاتصال بـ ${urlWithCacheBuster}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // الانتظار قبل المحاولة التالية مع زيادة وقت الانتظار
          await exponentialBackoff(MAX_RETRIES - retries);
          
          // تحديث معلمات منع التخزين المؤقت لكل محاولة
          const newCacheUrl = addCacheBusterToUrl(remoteUrl);
          console.log(`محاولة جديدة مع معلمات منع التخزين المؤقت: ${newCacheUrl}`);
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
