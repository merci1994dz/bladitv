
/**
 * نقطة الدخول الرئيسية لوظائف الجلب
 * Main entry point for fetching functions
 */

import { fetchWithAllStrategies } from './fetchStrategies';
import { addCacheBusterToUrl, preventCacheForAllRequests, createCacheBuster } from './retryStrategies';
import { getSkewProtectionParams } from './skewProtection';
import { fetchRemoteData } from './fetchRemoteData';

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
  getSkewProtectionParams
};

/**
 * التحقق مما إذا كان عنوان URL الخارجي قابلاً للوصول
 * Check if remote URL is accessible
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  console.log(`التحقق من إمكانية الوصول إلى ${url}...`);
  
  // استخدام الإشارة للتمكن من إلغاء الطلب
  // Use signal to be able to cancel the request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  
  try {
    // محاولة الاتصال بالعنوان
    // Try connecting to the URL
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
      mode: 'no-cors'
    });
    
    // إلغاء المهلة
    // Cancel timeout
    clearTimeout(timeoutId);
    
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    console.warn(`تعذر الوصول إلى ${url}:`, error);
    
    // إلغاء المهلة
    // Cancel timeout
    clearTimeout(timeoutId);
    
    return false;
  }
};
