
/**
 * نقطة الدخول الرئيسية لوظائف الجلب
 * Main entry point for fetching functions
 */

import { fetchWithAllStrategies } from './fetchStrategies';
import { addCacheBusterToUrl, preventCacheForAllRequests, createCacheBuster } from './retryStrategies';
import { getSkewProtectionParams } from './skewProtection';
import { fetchRemoteData, isRemoteUrlAccessible } from './fetchRemoteData';

/**
 * جلب البيانات مع مهلة زمنية
 * Fetch data with timeout
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 15000
): Promise<Response> => {
  const controller = new AbortController();
  const { signal, ...fetchOptions } = options;
  
  // إذا تم تمرير إشارة، يتم دمجها مع إشارة المهلة الزمنية
  // If a signal was passed, merge it with the timeout signal
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  
  // إنشاء وعد مع مهلة زمنية
  // Create a promise with timeout
  const timeoutPromise = new Promise<Response>((_, reject) => {
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`تجاوز المهلة الزمنية (${timeoutMs}ms) أثناء الطلب إلى ${url}`));
    }, timeoutMs);
    
    // تنظيف المؤقت إذا تم إلغاء الطلب
    // Clean up timer if request is aborted
    controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
  });
  
  // تنفيذ الطلب مع دمج الخيارات
  // Execute request with merged options
  const fetchPromise = fetch(url, {
    ...fetchOptions,
    signal: controller.signal
  });
  
  // إرجاع أول وعد يتم حله (إما الطلب أو المهلة الزمنية)
  // Return the first promise to resolve (either the request or the timeout)
  return Promise.race([fetchPromise, timeoutPromise]);
};

// تصدير الوظائف من الملفات الأخرى
// Export functions from other files
export { 
  fetchWithAllStrategies,
  addCacheBusterToUrl, 
  preventCacheForAllRequests,
  createCacheBuster,
  fetchRemoteData,
  isRemoteUrlAccessible,
  getSkewProtectionParams
};
