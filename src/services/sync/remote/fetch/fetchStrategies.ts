
/**
 * استراتيجيات مختلفة لجلب البيانات
 * Different strategies for fetching data
 */

import { loadWithJsonp } from './jsonpFallback';
import { fetchViaProxy } from './proxyUtils';
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
  return await loadWithJsonp(url);
};

/**
 * محاولة جلب البيانات عبر بروكسي
 * Try to fetch data via proxy
 */
export const tryProxyStrategy = async (url: string, signal: AbortSignal): Promise<any> => {
  const urlWithCache = addCacheBusterToUrl(url);
  return await fetchViaProxy(urlWithCache, signal);
};

/**
 * محاولة جلب البيانات عبر طلب مباشر
 * Try to fetch data via direct request
 */
export const tryDirectFetchStrategy = async (url: string, retryCount: number, signal: AbortSignal): Promise<any> => {
  const urlWithCache = addCacheBusterToUrl(url);
  console.log(`محاولة الطلب المباشر للرابط: ${urlWithCache}`);
  
  // إنشاء الرؤوس الأساسية
  let headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin,
    'X-Timestamp': Date.now().toString(),
    'X-Random': Math.random().toString(36).substring(2, 15)
  };
  
  // إضافة رؤوس حماية التزامن
  headers = addSkewProtectionHeaders(headers);
  
  // تكييف خيارات الطلب بناءً على المتصفح وعدد المحاولات
  let fetchOptions: RequestInit = {
    method: 'GET',
    headers,
    cache: 'no-store',
    signal,
    mode: retryCount > 6 ? 'cors' : 'no-cors',
    credentials: 'omit',
    referrer: window.location.origin,
    referrerPolicy: 'origin'
  };
  
  fetchOptions = adjustFetchOptionsForBrowser(fetchOptions, retryCount);
  
  // تنفيذ الطلب
  const response = await fetch(urlWithCache, fetchOptions);
  
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
};
