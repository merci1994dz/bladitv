
/**
 * وظائف جلب البيانات من المصادر الخارجية
 * Functions for fetching data from external sources
 */

import { fetchWithAllStrategies } from './fetchStrategies';

/**
 * جلب البيانات من مصدر خارجي
 * Fetch data from remote source
 */
export const fetchRemoteData = async (url: string): Promise<any> => {
  console.log(`جلب البيانات من ${url}...`);
  
  // استخدام الإشارة للتمكن من إلغاء الطلب
  // Use signal to be able to cancel the request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
  
  try {
    // محاولة جلب البيانات باستخدام جميع الاستراتيجيات المتاحة
    // Try fetching data using all available strategies
    const data = await fetchWithAllStrategies(url, 0, controller.signal);
    
    // إلغاء المهلة
    // Cancel timeout
    clearTimeout(timeoutId);
    
    return data;
  } catch (error) {
    console.error(`خطأ في جلب البيانات من ${url}:`, error);
    
    // إلغاء المهلة
    // Cancel timeout
    clearTimeout(timeoutId);
    
    throw error;
  }
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
