
/**
 * الوظيفة الرئيسية لفحص الاتصال واختبار توفر الخوادم
 * Main function for connectivity checking and server availability testing
 */

import { 
  getCachedConnectivityResult, 
  isRecentCheck, 
  cacheConnectivityResult 
} from './cache';
import { checkEndpointsAccessibility } from './endpoint-checker';
import { ConnectivityCheckResult } from './types';

/**
 * فحص ما إذا كانت هناك أي مشاكل اتصال تعرقل المزامنة
 * Check if there are any connectivity issues hindering synchronization
 * with enhanced retry support and detailed diagnostics
 */
export const checkConnectivityIssues = async (): Promise<{ hasInternet: boolean, hasServerAccess: boolean }> => {
  // محاولة استرداد نتائج الفحص المخزنة وتقييم صلاحيتها
  // Try to retrieve stored check results and evaluate their validity
  const cachedResult = getCachedConnectivityResult();
  
  // إذا كانت النتائج المخزنة حديثة وصالحة، استخدمها
  // If stored results are recent and valid, use them
  if (cachedResult && isRecentCheck(cachedResult.timestamp)) {
    return {
      hasInternet: cachedResult.hasInternet,
      hasServerAccess: cachedResult.hasServerAccess
    };
  }
  
  // التحقق من حالة الإنترنت أولاً
  // Check internet status first
  const hasInternet = navigator.onLine;
  
  // إذا لم يكن هناك اتصال بالإنترنت، ارجع النتيجة على الفور
  // If there is no internet connection, return the result immediately
  if (!hasInternet) {
    const result: ConnectivityCheckResult = { 
      hasInternet: false, 
      hasServerAccess: false,
      timestamp: Date.now()
    };
    cacheConnectivityResult(result);
    return result;
  }
  
  // إذا كان هناك اتصال بالإنترنت، فحص الوصول إلى الخوادم
  // If there is internet connection, check server access
  try {
    // فحص الوصول إلى الخوادم باستخدام استراتيجية إعادة المحاولة التدريجية
    // Check server access using progressive retry strategy
    const endpoints = await checkEndpointsAccessibility();
    
    // اعتبار الاتصال ناجحًا إذا نجح الوصول إلى خادم واحد على الأقل
    // Consider connection successful if at least one server is accessible
    const hasServerAccess = endpoints.some(endpoint => endpoint.success);
    
    // تكوين نتيجة فحص الاتصال
    // Configure connection check result
    const result: ConnectivityCheckResult = {
      hasInternet,
      hasServerAccess,
      timestamp: Date.now(),
      endpoints
    };
    
    // تخزين نتيجة الفحص للاستخدام لاحقًا
    // Store check result for later use
    cacheConnectivityResult(result);
    
    // ارجاع نتيجة فحص الاتصال
    // Return connection check result
    return {
      hasInternet,
      hasServerAccess
    };
  } catch (error) {
    console.warn('خطأ أثناء فحص الاتصال بالخوادم: / Error during server connection check:', error);
    
    // في حالة الخطأ، استخدم النتائج المخزنة إذا كانت متاحة
    // In case of error, use stored results if available
    if (cachedResult) {
      return {
        hasInternet: hasInternet,  // استخدم حالة الاتصال الحالية / Use current connection status
        hasServerAccess: cachedResult.hasServerAccess
      };
    }
    
    // إذا لم تكن هناك نتائج مخزنة، افترض عدم وجود اتصال بالخادم
    // If there are no stored results, assume no server connection
    const result: ConnectivityCheckResult = {
      hasInternet,
      hasServerAccess: false,
      timestamp: Date.now()
    };
    
    cacheConnectivityResult(result);
    
    return result;
  }
};
