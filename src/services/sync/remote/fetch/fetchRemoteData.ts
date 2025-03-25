
/**
 * وظيفة محسنة لجلب البيانات من مصادر خارجية
 * Optimized function for fetching data from external sources
 */

import { validateRemoteData } from '../../remoteValidation';
import { fetchLocalFile } from './localFetch';
import { tryDirectFetchStrategy, tryProxyStrategy, tryJsonpStrategy, fetchWithAllStrategies } from './fetchStrategies';
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
    try {
      const localData = await fetchLocalFile(remoteUrl);
      if (!validateRemoteData(localData)) {
        throw new Error('بيانات المصدر المحلي غير صالحة');
      }
      return localData;
    } catch (error) {
      console.error('فشل في جلب الملف المحلي:', error);
      throw enhanceFetchError(error);
    }
  }
  
  // ضمان وجود معلمات منع التخزين المؤقت في الرابط
  const urlWithCacheBuster = addCacheBusterToUrl(remoteUrl);
  
  // إعداد مراقبة الوقت - تعديل وقت المهلة بناءً على بيئة التشغيل
  const timeoutMs = isRunningOnVercel() ? 25000 : 20000; // مهلة أطول على Vercel
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
        // استخدام استراتيجية موحدة محسنة
        const data = await fetchWithAllStrategies(
          urlWithCacheBuster, 
          MAX_RETRIES - retries + 1, 
          controller.signal
        );
        
        // التحقق من صحة البيانات
        if (data && validateRemoteData(data)) {
          clearTimeout(timeoutId);
          return data;
        } else {
          console.warn('تم استلام بيانات لكنها لم تمر بالتحقق من الصحة');
          throw new Error('البيانات المستلمة غير صالحة أو غير مكتملة');
        }
      } catch (error) {
        console.warn(`فشلت المحاولة ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} للاتصال بـ ${urlWithCacheBuster}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // استخدام تأخير تصاعدي مع تباطؤ أقل على Vercel
          const baseWaitTime = isRunningOnVercel() ? 1200 : 1500;
          const waitTime = baseWaitTime * (MAX_RETRIES - retries) + Math.random() * 800; 
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

/**
 * فحص ما إذا كان هناك مشكلة في الشبكة عند الاتصال بمصدر خارجي
 * Check if there's a network problem when connecting to an external source
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    // استخدام طلب HEAD لأنه أسرع
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    return true; // في وضع no-cors، أي استجابة (حتى لو كانت غير معروفة) تعتبر نجاحًا
  } catch (error) {
    console.warn(`فشل فحص الوصول إلى ${url}:`, error);
    return false;
  }
};
