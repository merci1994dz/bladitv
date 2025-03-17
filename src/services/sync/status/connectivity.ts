
/**
 * مسؤول عن فحص حالة الاتصال والتحقق من الوصول إلى الخوادم
 * Responsible for checking connection status and verifying server accessibility
 * Enhanced with comprehensive diagnostics and robust retry logic
 */

import { createProgressiveRetryStrategy, retry } from '@/utils/retryStrategy';

// العناوين المستخدمة لاختبار الاتصال بالإنترنت والخوادم
// Endpoints used to test internet connection and server accessibility
const CONNECTIVITY_CHECK_ENDPOINTS = [
  'https://bladitv.lovable.app/ping',
  'https://bladi-info.com/ping',
  'https://bladiinfo-api.vercel.app/ping',
  'https://bladiinfo-backup.netlify.app/ping',
  'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/ping'
];

// مدة صلاحية الاختبار (بالمللي ثانية) - دقيقة واحدة
// Test validity period (in milliseconds) - one minute
const CHECK_VALIDITY_PERIOD = 60 * 1000;

// مفتاح تخزين نتائج فحص الاتصال في جلسة المتصفح
// Storage key for connection check results in browser session
const CONNECTIVITY_STORAGE_KEY = 'last_connectivity_check';

// نوع بيانات نتيجة فحص الاتصال
// Data type for connection check result
interface ConnectivityCheckResult {
  hasInternet: boolean;
  hasServerAccess: boolean;
  timestamp: number;
  endpoints?: {
    url: string;
    success: boolean;
    responseTime?: number;
    error?: string;
  }[];
}

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
    const result = { hasInternet: false, hasServerAccess: false };
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
    return {
      hasInternet,
      hasServerAccess: false
    };
  }
};

/**
 * فحص إمكانية الوصول إلى نقاط النهاية المختلفة بشكل متوازي
 * Check accessibility of different endpoints in parallel
 * with retry attempts and performance statistics
 */
async function checkEndpointsAccessibility() {
  // إنشاء قائمة بالوعود لفحص كل نقطة نهاية
  // Create a list of promises to check each endpoint
  const endpointPromises = CONNECTIVITY_CHECK_ENDPOINTS.map(async (url) => {
    try {
      // استخدام استراتيجية إعادة المحاولة لكل نقطة نهاية
      // Use retry strategy for each endpoint
      return await retry(
        async () => {
          const startTime = performance.now();
          
          // إنشاء وحدة تحكم بالمهلة الزمنية
          // Create timeout controller
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          try {
            // محاولة الاتصال بنقطة النهاية
            // Try to connect to the endpoint
            const response = await fetch(url, {
              method: 'HEAD',
              signal: controller.signal,
              cache: 'no-store',
              mode: 'cors',
              credentials: 'omit',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });
            
            // إلغاء المهلة الزمنية بعد الاستجابة
            // Cancel timeout after response
            clearTimeout(timeoutId);
            
            // حساب زمن الاستجابة
            // Calculate response time
            const responseTime = Math.round(performance.now() - startTime);
            
            // التحقق من نجاح الاستجابة
            // Check response success
            return {
              url,
              success: response.ok,
              responseTime
            };
          } catch (error) {
            // إلغاء المهلة الزمنية في حالة حدوث خطأ
            // Cancel timeout in case of error
            clearTimeout(timeoutId);
            
            // إعادة رمي الخطأ للتعامل معه في إعادة المحاولة
            // Re-throw error to handle it in retry
            throw error;
          }
        },
        {
          ...createProgressiveRetryStrategy(2),
          onRetry: (error, attempt) => {
            console.log(`إعادة محاولة الاتصال بـ / Retrying connection to ${url} (${attempt}/2)`);
          }
        }
      );
    } catch (error) {
      // في حالة فشل جميع محاولات إعادة الاتصال، ارجاع فشل للنقطة النهائية
      // In case all retry attempts fail, return failure for the endpoint
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  // انتظار انتهاء جميع الفحوصات
  // Wait for all checks to complete
  const results = await Promise.all(endpointPromises);
  
  // ترتيب النتائج حسب النجاح ثم حسب سرعة الاستجابة
  // Sort results by success then by response speed
  return results.sort((a, b) => {
    // ترتيب النقاط الناجحة أولاً
    // Sort successful points first
    if (a.success && !b.success) return -1;
    if (!a.success && b.success) return 1;
    
    // ثم الترتيب حسب زمن الاستجابة (الأسرع أولاً)
    // Then sort by response time (fastest first)
    if (a.success && b.success) {
      return (a.responseTime || 0) - (b.responseTime || 0);
    }
    
    return 0;
  });
}

/**
 * التحقق مما إذا كان الفحص حديثًا (أقل من الفترة المحددة)
 * Check if the check is recent (less than the specified period)
 */
function isRecentCheck(timestamp: number): boolean {
  return Date.now() - timestamp < CHECK_VALIDITY_PERIOD;
}

/**
 * استرداد نتائج فحص الاتصال المخزنة
 * Retrieve stored connection check results
 */
function getCachedConnectivityResult(): ConnectivityCheckResult | null {
  try {
    const storedData = sessionStorage.getItem(CONNECTIVITY_STORAGE_KEY);
    if (!storedData) return null;
    
    return JSON.parse(storedData);
  } catch (error) {
    console.warn('خطأ في استرداد بيانات الاتصال المخزنة: / Error retrieving stored connection data:', error);
    return null;
  }
}

/**
 * تخزين نتائج فحص الاتصال
 * Store connection check results
 */
function cacheConnectivityResult(result: ConnectivityCheckResult): void {
  try {
    sessionStorage.setItem(CONNECTIVITY_STORAGE_KEY, JSON.stringify(result));
  } catch (error) {
    console.warn('خطأ في تخزين نتائج فحص الاتصال: / Error storing connection check results:', error);
  }
}

/**
 * فحص التوافر النسبي للشبكة - تقدير أكثر دقة لجودة الاتصال
 * Check relative network availability - more accurate estimate of connection quality
 * Not exported to maintain current API
 */
async function checkNetworkReliability(): Promise<{
  reliability: 'high' | 'medium' | 'low' | 'none';
  averageResponseTime: number;
  successRate: number;
}> {
  // فحص الاتصال بجميع نقاط النهاية
  // Check connection to all endpoints
  const endpoints = await checkEndpointsAccessibility();
  
  // حساب معدل النجاح
  // Calculate success rate
  const successRate = endpoints.filter(e => e.success).length / endpoints.length;
  
  // حساب متوسط زمن الاستجابة للنقاط الناجحة
  // Calculate average response time for successful points
  const successfulEndpoints = endpoints.filter(e => e.success && e.responseTime !== undefined);
  const averageResponseTime = successfulEndpoints.length
    ? successfulEndpoints.reduce((sum, e) => sum + (e.responseTime || 0), 0) / successfulEndpoints.length
    : 0;
  
  // تحديد موثوقية الشبكة بناءً على معدل النجاح ومتوسط زمن الاستجابة
  // Determine network reliability based on success rate and average response time
  let reliability: 'high' | 'medium' | 'low' | 'none';
  
  if (successRate === 0) {
    reliability = 'none';
  } else if (successRate < 0.3 || averageResponseTime > 2000) {
    reliability = 'low';
  } else if (successRate < 0.7 || averageResponseTime > 1000) {
    reliability = 'medium';
  } else {
    reliability = 'high';
  }
  
  return {
    reliability,
    averageResponseTime,
    successRate
  };
}
