
/**
 * استراتيجيات الاتصال مع المصادر الخارجية
 * Connection strategies with external sources
 */

import { addCacheBusterToUrl } from './retryStrategies';

/**
 * جلب البيانات باستخدام جميع الاستراتيجيات المتاحة
 * Fetch data using all available strategies
 */
export const fetchWithAllStrategies = async (
  url: string, 
  retryCount: number = 0,
  signal?: AbortSignal
): Promise<any> => {
  console.log(`محاولة جلب البيانات من ${url} (محاولة: ${retryCount})`);
  
  try {
    // محاولة استخدام fetch العادي أولاً
    // Try using regular fetch first
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    // إذا فشلت المحاولة الأولى وسمح عداد إعادة المحاولة بمحاولة أخرى
    // If first attempt failed and retry count allows another attempt
    if (retryCount < 3) {
      console.log(`فشل في جلب البيانات من ${url}، جاري إعادة المحاولة...`);
      
      // إضافة معلمات لمنع التخزين المؤقت وإعادة المحاولة
      // Add cache busting parameters and retry
      const urlWithCacheBuster = addCacheBusterToUrl(url);
      
      // زيادة عدد مرات المحاولة وإعادة المحاولة
      // Increase retry count and retry
      return fetchWithAllStrategies(urlWithCacheBuster, retryCount + 1, signal);
    }
    
    console.error(`فشل في جلب البيانات بعد ${retryCount} محاولات:`, error);
    throw error;
  }
};
