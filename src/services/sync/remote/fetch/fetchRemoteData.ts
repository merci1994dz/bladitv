
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
  
  // إعداد مراقبة الوقت - تقليل وقت المهلة من 30 ثانية إلى 15 ثانية
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // مهلة 15 ثانية كحد أقصى
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCacheBuster}`);
    
    // إعداد محاولات متعددة - تقليل عدد المحاولات من 5 إلى 3
    const MAX_RETRIES = 3;
    let retries = MAX_RETRIES;
    let lastError;
    
    while (retries > 0) {
      try {
        let data;
        
        // تغيير ترتيب الاستراتيجيات: البدء بالطلب المباشر أولاً
        // محاولة الطلب المباشر كخيار أول
        try {
          data = await tryDirectFetchStrategy(
            urlWithCacheBuster, 
            retries, 
            controller.signal
          );
          
          // التحقق من صحة البيانات
          if (validateRemoteData(data)) {
            clearTimeout(timeoutId);
            return data;
          }
        } catch (directError) {
          console.warn('فشلت المحاولة المباشرة، المتابعة باستراتيجيات أخرى');
        }
        
        // محاولة استخدام JSONP ثانياً
        if (retries <= 2) {
          try {
            data = await tryJsonpStrategy(urlWithCacheBuster);
            console.log('نجحت محاولة JSONP');
            clearTimeout(timeoutId);
            
            // التحقق من صحة البيانات
            if (validateRemoteData(data)) {
              return data;
            }
          } catch (jsonpError) {
            console.warn('فشلت محاولة JSONP، المتابعة باستراتيجيات أخرى');
          }
        }
        
        // محاولة استخدام بروكسي CORS أخيراً
        if (retries <= 1) {
          try {
            data = await tryProxyStrategy(urlWithCacheBuster, controller.signal);
            console.log('نجحت محاولة البروكسي');
            clearTimeout(timeoutId);
            
            // التحقق من صحة البيانات
            if (validateRemoteData(data)) {
              return data;
            }
          } catch (proxyError) {
            console.warn('فشلت محاولات البروكسي');
          }
        }
        
        // إذا وصلنا إلى هنا، فإن جميع الاستراتيجيات قد فشلت في هذه المحاولة
        throw new Error('فشلت جميع استراتيجيات الاتصال في هذه المحاولة');
        
      } catch (error) {
        console.warn(`فشلت المحاولة ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} للاتصال بـ ${urlWithCacheBuster}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // تقليل وقت الانتظار بين المحاولات لتسريع العملية
          const waitTime = 2000 * (MAX_RETRIES - retries); // وقت انتظار أقصر
          console.log(`الانتظار ${waitTime}ms قبل المحاولة التالية...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
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
