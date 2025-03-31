
/**
 * وظائف جلب البيانات من المصادر الخارجية
 * Functions for fetching data from external sources
 */

import { addSkewProtectionHeaders } from './skewProtection';

/**
 * التحقق من إمكانية الوصول إلى عنوان URL
 * Check if a URL is accessible
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    // Use HEAD request instead of GET for better performance
    const method = url.startsWith('/') ? 'GET' : 'HEAD';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const headers = new Headers();
    addSkewProtectionHeaders(headers);
    
    const response = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`تعذر الوصول إلى ${url}:`, error);
    return false;
  }
};

/**
 * جلب البيانات من مصدر خارجي
 * Fetch data from an external source
 */
export const fetchRemoteData = async (url: string): Promise<any> => {
  try {
    const headers = new Headers();
    addSkewProtectionHeaders(headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`خطأ في جلب البيانات من ${url}:`, error);
    throw error;
  }
};
