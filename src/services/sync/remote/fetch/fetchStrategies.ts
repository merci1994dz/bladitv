
/**
 * استراتيجيات مختلفة لجلب البيانات
 * Different strategies for fetching data
 */

import { loadWithJsonp } from './jsonpFallback';
import { fetchViaProxy, getWorkingProxy } from './proxyUtils';
import { addCacheBusterToUrl } from './retryStrategies';
import { adjustFetchOptionsForBrowser } from './browserDetection';
import { processResponseError } from './errorHandling';
import { addSkewProtectionHeaders } from './skewProtection';

/**
 * محاولة جلب البيانات عبر JSONP
 * Try to fetch data via JSONP
 */
export const tryJsonpStrategy = async (url: string): Promise<any> => {
  console.log(`محاولة استخدام JSONP للرابط: ${url}`);
  try {
    return await loadWithJsonp(url);
  } catch (error) {
    console.warn(`فشلت استراتيجية JSONP: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * محاولة جلب البيانات عبر بروكسي
 * Try to fetch data via proxy
 */
export const tryProxyStrategy = async (url: string, signal: AbortSignal): Promise<any> => {
  try {
    // استخدم URL مع معلمات منع التخزين المؤقت
    const urlWithCache = addCacheBusterToUrl(url);
    
    // البحث عن بروكسي يعمل (اختياري)
    const workingProxy = await getWorkingProxy(urlWithCache);
    if (workingProxy) {
      console.log(`تم العثور على بروكسي يعمل: ${workingProxy}`);
    }
    
    // محاولة استخدام البروكسي
    return await fetchViaProxy(urlWithCache, signal);
  } catch (error) {
    console.warn(`فشلت استراتيجية البروكسي: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * محاولة جلب البيانات عبر طلب مباشر
 * Try to fetch data via direct request
 */
export const tryDirectFetchStrategy = async (url: string, retryCount: number, signal: AbortSignal): Promise<any> => {
  try {
    // إضافة معلمات منع التخزين المؤقت
    const urlWithCache = addCacheBusterToUrl(url);
    console.log(`محاولة الطلب المباشر للرابط: ${urlWithCache}`);
    
    // إنشاء الرؤوس الأساسية مع رؤوس إضافية للتغلب على قيود CORS
    let headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': window.location.origin,
      'X-Timestamp': Date.now().toString(),
      'X-Random': Math.random().toString(36).substring(2, 15),
      'X-Client-Version': '1.0.0',
      'X-App-Platform': 'web'
    };
    
    // إضافة رؤوس حماية التزامن
    headers = addSkewProtectionHeaders(headers);
    
    // تكييف خيارات الطلب بناءً على المتصفح وعدد المحاولات
    // تعديل استراتيجية mode بناءً على رقم المحاولة
    const mode = retryCount <= 2 ? 'cors' : (retryCount <= 4 ? 'no-cors' : 'cors');
    
    let fetchOptions: RequestInit = {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal,
      mode,
      credentials: 'omit',
      referrer: window.location.origin,
      referrerPolicy: 'origin'
    };
    
    // تعديل الخيارات بناءً على المتصفح
    fetchOptions = adjustFetchOptionsForBrowser(fetchOptions, retryCount);
    
    // تنفيذ الطلب مع استخدام إشارة إلغاء للمهلة الزمنية
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // مهلة 10 ثوانٍ
    
    // دمج إشارات الإلغاء
    const combinedSignal = new AbortController();
    signal.addEventListener('abort', () => combinedSignal.abort());
    controller.signal.addEventListener('abort', () => combinedSignal.abort());
    
    // تنفيذ الطلب
    const response = await fetch(urlWithCache, {
      ...fetchOptions,
      signal: combinedSignal.signal
    });
    
    // إلغاء المهلة الزمنية
    clearTimeout(timeoutId);
    
    // معالجة الاستجابة
    if (!response.ok) {
      const errorMessage = await processResponseError(response);
      throw new Error(errorMessage);
    }
    
    // تحليل البيانات
    try {
      const text = await response.text();
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('خطأ في تحليل JSON:', jsonError);
      throw new Error('تم استلام رد غير صالح من الخادم (بيانات JSON غير صالحة)');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`فشل الطلب المباشر: ${errorMessage}`);
    throw error;
  }
};

/**
 * استراتيجية موحدة لجلب البيانات تحاول استخدام جميع الاستراتيجيات المتاحة
 * Unified strategy for fetching data that tries all available strategies
 */
export const fetchWithAllStrategies = async (url: string, retryCount: number, signal: AbortSignal): Promise<any> => {
  const errors: Record<string, string> = {};
  
  // محاولة الطلب المباشر أولاً
  try {
    return await tryDirectFetchStrategy(url, retryCount, signal);
  } catch (directError) {
    errors.direct = directError instanceof Error ? directError.message : String(directError);
    console.warn('فشل الطلب المباشر، جاري تجربة البروكسي...');
  }
  
  // محاولة استخدام البروكسي ثانيًا
  try {
    return await tryProxyStrategy(url, signal);
  } catch (proxyError) {
    errors.proxy = proxyError instanceof Error ? proxyError.message : String(proxyError);
    console.warn('فشل استخدام البروكسي، جاري تجربة JSONP...');
  }
  
  // محاولة استخدام JSONP أخيرًا
  try {
    return await tryJsonpStrategy(url);
  } catch (jsonpError) {
    errors.jsonp = jsonpError instanceof Error ? jsonpError.message : String(jsonpError);
    console.warn('فشل استخدام JSONP، لا توجد استراتيجيات متبقية');
  }
  
  // إذا وصلنا إلى هنا، فإن جميع الاستراتيجيات قد فشلت
  console.error('فشلت جميع استراتيجيات جلب البيانات:', errors);
  throw new Error(`فشلت جميع استراتيجيات الاتصال (المباشر: ${errors.direct}, البروكسي: ${errors.proxy}, JSONP: ${errors.jsonp})`);
};
