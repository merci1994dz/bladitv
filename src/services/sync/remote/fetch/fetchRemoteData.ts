
/**
 * وظائف جلب البيانات من المصادر الخارجية
 * Functions for fetching data from external sources
 */

import { fetchWithAllStrategies, isRemoteUrlAccessible } from './index';

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

// تصدير الوظيفة isRemoteUrlAccessible من الأعلى
// Export the isRemoteUrlAccessible function from above
export { isRemoteUrlAccessible };
