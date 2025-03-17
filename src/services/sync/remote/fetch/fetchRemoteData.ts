
/**
 * Core functionality for fetching remote data
 */

import { validateRemoteData } from '../../remoteValidation';
import { fetchLocalFile } from './localFetch';
import { adjustFetchOptionsForBrowser } from './browserDetection';
import { loadWithJsonp } from './jsonpFallback';
import { addSkewProtectionHeaders } from './skewProtection';
import { processResponseError, enhanceFetchError } from './errorHandling';

/**
 * Fetches data from a remote URL with cache-busting parameters and timeout protection
 * 
 * @param remoteUrl URL to fetch data from
 * @returns Promise resolving with fetched data
 */
export const fetchRemoteData = async (remoteUrl: string): Promise<any> => {
  // التعامل مع المصادر المحلية
  if (remoteUrl.startsWith('/')) {
    return fetchLocalFile(remoteUrl);
  }
  
  // إضافة معلمات لتجنب التخزين المؤقت
  const cacheParam = `nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
  const urlWithCache = remoteUrl.includes('?') 
    ? `${remoteUrl}&${cacheParam}` 
    : `${remoteUrl}?${cacheParam}`;
  
  // إضافة حماية التزامن Vercel Skew Protection
  let headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin
  };
  
  // إضافة رأس معرف النشر إذا كانت حماية التزامن مُفعلة
  headers = addSkewProtectionHeaders(headers);
  
  // زيادة وقت المهلة الزمنية إلى 45 ثانية
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
    
    // تحسين معالجة الأخطاء مع دعم متعدد المتصفحات
    let retries = 8; // زيادة عدد المحاولات لتحسين الاتصال
    let lastError;
    
    while (retries > 0) {
      try {
        // تعديل خيارات الطلب بناءً على المتصفح والمحاولة الحالية
        let fetchOptions: RequestInit = {
          method: 'GET',
          headers,
          cache: 'no-store',
          signal: controller.signal,
          mode: retries > 6 ? 'cors' : 'no-cors', // محاولة no-cors بعد فشل cors
          credentials: 'omit',
          referrer: window.location.origin,
          referrerPolicy: 'origin'
        };
        
        // تكييف خيارات الطلب للمتصفحات المختلفة
        fetchOptions = adjustFetchOptionsForBrowser(fetchOptions, retries);
        
        // محاولة مقاربات مختلفة حسب عدد المحاولات المتبقية
        if (retries <= 5) {
          // في المحاولات الأخيرة، استخدم JSONP للتغلب على قيود CORS
          try {
            console.log(`محاولة استخدام JSONP للرابط: ${urlWithCache}`);
            const jsonpData = await loadWithJsonp(urlWithCache);
            clearTimeout(timeoutId);
            return jsonpData;
          } catch (jsonpError) {
            console.warn('فشلت محاولة JSONP، سنواصل المحاولة بالطرق التقليدية');
          }
        }
        
        // محاولة فتح proxy إذا فشلت المحاولات المباشرة
        if (retries <= 3) {
          const proxyUrls = [
            `https://corsproxy.io/?${encodeURIComponent(urlWithCache)}`,
            `https://cors-anywhere.herokuapp.com/${urlWithCache}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(urlWithCache)}`,
            `https://proxy.cors.sh/${urlWithCache}`
          ];
          
          const proxyUrl = proxyUrls[8 - retries % proxyUrls.length];
          console.log(`محاولة استخدام بروكسي CORS: ${proxyUrl}`);
          try {
            const proxyResponse = await fetch(proxyUrl, {
              method: 'GET',
              cache: 'no-store',
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              }
            });
            
            if (proxyResponse.ok) {
              const text = await proxyResponse.text();
              try {
                const data = JSON.parse(text);
                clearTimeout(timeoutId);
                return data;
              } catch (jsonError) {
                console.warn('تم استلام استجابة من البروكسي لكن فشل تحليل JSON:', jsonError);
              }
            }
          } catch (proxyError) {
            console.warn(`فشل استخدام بروكسي CORS: ${proxyError.message}`);
          }
        }
        
        // محاولة الطلب المباشر
        console.log(`محاولة الطلب المباشر للرابط: ${urlWithCache}`);
        const response = await fetch(urlWithCache, fetchOptions);
        
        if (!response.ok) {
          const errorMessage = await processResponseError(response);
          throw new Error(errorMessage);
        }
        
        // تحليل البيانات مع معالجة أفضل لأخطاء JSON
        let data;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error('خطأ في تحليل JSON:', jsonError);
          throw new Error('تم استلام رد غير صالح من الخادم (بيانات JSON غير صالحة)');
        }
        
        // التحقق من صحة البيانات
        if (!validateRemoteData(data)) {
          throw new Error('البيانات المستلمة غير صالحة أو لا تتطابق مع الهيكل المتوقع');
        }
        
        clearTimeout(timeoutId);
        return data;
      } catch (error) {
        console.warn(`فشلت المحاولة ${9 - retries}/8 للاتصال بـ ${remoteUrl}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // الانتظار قبل المحاولة مرة أخرى مع زيادة وقت الانتظار 
          const backoffTime = (9 - retries) * 2000 + Math.random() * 1000;
          console.log(`الانتظار ${backoffTime}ms قبل المحاولة التالية...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
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
