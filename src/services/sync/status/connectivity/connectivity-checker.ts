
/**
 * وظائف فحص الاتصال
 * Connectivity checking functions
 */

import { isRemoteUrlAccessible } from '../../remote/fetch';
import { BLADI_INFO_SOURCES } from '../../remote/sync/sources';

/**
 * فحص مشاكل الاتصال
 * Check connectivity issues
 */
export const checkConnectivityIssues = async (): Promise<{ 
  hasInternet: boolean; 
  hasServerAccess: boolean; 
}> => {
  try {
    // فحص ما إذا كان هناك اتصال بالإنترنت
    // Check if there's internet connection
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      return { hasInternet: false, hasServerAccess: false };
    }
    
    // محاولة الوصول إلى خوادم التطبيق
    // Try to access application servers
    for (const source of BLADI_INFO_SOURCES) {
      try {
        const isAccessible = await isRemoteUrlAccessible(source);
        
        if (isAccessible) {
          return { hasInternet: true, hasServerAccess: true };
        }
      } catch (error) {
        console.warn(`تعذر الوصول إلى ${source}:`, error);
      }
    }
    
    // إذا لم يتم الوصول إلى أي مصدر، فهناك إنترنت ولكن لا يمكن الوصول إلى الخوادم
    // If no source is accessible, there's internet but no server access
    return { hasInternet: true, hasServerAccess: false };
  } catch (error) {
    console.error('خطأ في فحص مشاكل الاتصال:', error);
    return { hasInternet: navigator.onLine, hasServerAccess: false };
  }
};
