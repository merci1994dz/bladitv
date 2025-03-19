
/**
 * وظيفة محسنة لجلب البيانات من مصادر خارجية
 * Optimized function for fetching data from external sources
 */

import { validateRemoteData } from '../../remoteValidation';
import { fetchLocalFile } from './localFetch';
import { tryJsonpStrategy, tryProxyStrategy, tryDirectFetchStrategy } from './fetchStrategies';
import { addCacheBusterToUrl } from './retryStrategies';
import { enhanceFetchError } from './errorHandling';
import { isRunningOnVercel } from './skewProtection';

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
  
  // إعداد مراقبة الوقت - تعديل وقت المهلة بناءً على بيئة التشغيل
  const timeoutMs = isRunningOnVercel() ? 20000 : 15000; // مهلة أطول على Vercel
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCacheBuster}`);
    
    // إعداد محاولات متعددة - عدد المحاولات بناءً على البيئة
    const MAX_RETRIES = isRunningOnVercel() ? 4 : 3;
    let retries = MAX_RETRIES;
    let lastError;
    
    while (retries > 0) {
      try {
        let data;
        
        // اختيار استراتيجية مناسبة بناءً على البيئة والمحاولة
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
        
        // محاولة استخدام بروكسي CORS ثانياً (أكثر موثوقية على Vercel)
        if (isRunningOnVercel() || retries <= 2) {
          try {
            data = await tryProxyStrategy(urlWithCacheBuster, controller.signal);
            console.log('نجحت محاولة البروكسي');
            clearTimeout(timeoutId);
            
            // التحقق من صحة البيانات
            if (validateRemoteData(data)) {
              return data;
            }
          } catch (proxyError) {
            console.warn('فشلت محاولة البروكسي، المتابعة باستراتيجيات أخرى');
          }
        }
        
        // محاولة استخدام JSONP أخيراً
        if (retries <= 1) {
          try {
            data = await tryJsonpStrategy(urlWithCacheBuster);
            console.log('نجحت محاولة JSONP');
            clearTimeout(timeoutId);
            
            // التحقق من صحة البيانات
            if (validateRemoteData(data)) {
              return data;
            }
          } catch (jsonpError) {
            console.warn('فشلت محاولات JSONP');
          }
        }
        
        // إذا وصلنا إلى هنا، فإن جميع الاستراتيجيات قد فشلت في هذه المحاولة
        throw new Error('فشلت جميع استراتيجيات الاتصال في هذه المحاولة');
        
      } catch (error) {
        console.warn(`فشلت المحاولة ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} للاتصال بـ ${urlWithCacheBuster}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // استخدام تأخير تصاعدي مع تباطؤ أقل على Vercel
          const baseWaitTime = isRunningOnVercel() ? 1500 : 2000;
          const waitTime = baseWaitTime * (MAX_RETRIES - retries); 
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
