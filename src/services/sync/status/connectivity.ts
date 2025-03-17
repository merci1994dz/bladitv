
/**
 * مسؤول عن فحص حالة الاتصال والتحقق من الوصول إلى الخوادم
 * Enhanced with comprehensive diagnostics and robust retry logic
 */

import { createProgressiveRetryStrategy, retry } from '@/utils/retryStrategy';

// العناوين المستخدمة لاختبار الاتصال بالإنترنت والخوادم
const CONNECTIVITY_CHECK_ENDPOINTS = [
  'https://bladitv.lovable.app/ping',
  'https://bladi-info.com/ping',
  'https://bladiinfo-api.vercel.app/ping',
  'https://bladiinfo-backup.netlify.app/ping',
  'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/ping'
];

// مدة صلاحية الاختبار (بالمللي ثانية) - دقيقة واحدة
const CHECK_VALIDITY_PERIOD = 60 * 1000;

// مفتاح تخزين نتائج فحص الاتصال في جلسة المتصفح
const CONNECTIVITY_STORAGE_KEY = 'last_connectivity_check';

// نوع بيانات نتيجة فحص الاتصال
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
 * مع دعم محسن لإعادة المحاولة وتشخيصات مفصلة
 */
export const checkConnectivityIssues = async (): Promise<{ hasInternet: boolean, hasServerAccess: boolean }> => {
  // محاولة استرداد نتائج الفحص المخزنة وتقييم صلاحيتها
  const cachedResult = getCachedConnectivityResult();
  
  // إذا كانت النتائج المخزنة حديثة وصالحة، استخدمها
  if (cachedResult && isRecentCheck(cachedResult.timestamp)) {
    return {
      hasInternet: cachedResult.hasInternet,
      hasServerAccess: cachedResult.hasServerAccess
    };
  }
  
  // التحقق من حالة الإنترنت أولاً
  const hasInternet = navigator.onLine;
  
  // إذا لم يكن هناك اتصال بالإنترنت، ارجع النتيجة على الفور
  if (!hasInternet) {
    const result = { hasInternet: false, hasServerAccess: false };
    cacheConnectivityResult(result);
    return result;
  }
  
  // إذا كان هناك اتصال بالإنترنت، فحص الوصول إلى الخوادم
  try {
    // فحص الوصول إلى الخوادم باستخدام استراتيجية إعادة المحاولة التدريجية
    const endpoints = await checkEndpointsAccessibility();
    
    // اعتبار الاتصال ناجحًا إذا نجح الوصول إلى خادم واحد على الأقل
    const hasServerAccess = endpoints.some(endpoint => endpoint.success);
    
    // تكوين نتيجة فحص الاتصال
    const result: ConnectivityCheckResult = {
      hasInternet,
      hasServerAccess,
      timestamp: Date.now(),
      endpoints
    };
    
    // تخزين نتيجة الفحص للاستخدام لاحقًا
    cacheConnectivityResult(result);
    
    // ارجاع نتيجة فحص الاتصال
    return {
      hasInternet,
      hasServerAccess
    };
  } catch (error) {
    console.warn('خطأ أثناء فحص الاتصال بالخوادم:', error);
    
    // في حالة الخطأ، استخدم النتائج المخزنة إذا كانت متاحة
    if (cachedResult) {
      return {
        hasInternet: hasInternet,  // استخدم حالة الاتصال الحالية
        hasServerAccess: cachedResult.hasServerAccess
      };
    }
    
    // إذا لم تكن هناك نتائج مخزنة، افترض عدم وجود اتصال بالخادم
    return {
      hasInternet,
      hasServerAccess: false
    };
  }
};

/**
 * فحص إمكانية الوصول إلى نقاط النهاية المختلفة بشكل متوازي
 * مع محاولات إعادة وإحصاءات للأداء
 */
async function checkEndpointsAccessibility() {
  // إنشاء قائمة بالوعود لفحص كل نقطة نهاية
  const endpointPromises = CONNECTIVITY_CHECK_ENDPOINTS.map(async (url) => {
    try {
      // استخدام استراتيجية إعادة المحاولة لكل نقطة نهاية
      return await retry(
        async () => {
          const startTime = performance.now();
          
          // إنشاء وحدة تحكم بالمهلة الزمنية
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          try {
            // محاولة الاتصال بنقطة النهاية
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
            clearTimeout(timeoutId);
            
            // حساب زمن الاستجابة
            const responseTime = Math.round(performance.now() - startTime);
            
            // التحقق من نجاح الاستجابة
            return {
              url,
              success: response.ok,
              responseTime
            };
          } catch (error) {
            // إلغاء المهلة الزمنية في حالة حدوث خطأ
            clearTimeout(timeoutId);
            
            // إعادة رمي الخطأ للتعامل معه في إعادة المحاولة
            throw error;
          }
        },
        {
          ...createProgressiveRetryStrategy(2),
          onRetry: (error, attempt) => {
            console.log(`إعادة محاولة الاتصال بـ ${url} (${attempt}/2)`);
          }
        }
      );
    } catch (error) {
      // في حالة فشل جميع محاولات إعادة الاتصال، ارجاع فشل للنقطة النهائية
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  // انتظار انتهاء جميع الفحوصات
  const results = await Promise.all(endpointPromises);
  
  // ترتيب النتائج حسب النجاح ثم حسب سرعة الاستجابة
  return results.sort((a, b) => {
    // ترتيب النقاط الناجحة أولاً
    if (a.success && !b.success) return -1;
    if (!a.success && b.success) return 1;
    
    // ثم الترتيب حسب زمن الاستجابة (الأسرع أولاً)
    if (a.success && b.success) {
      return (a.responseTime || 0) - (b.responseTime || 0);
    }
    
    return 0;
  });
}

/**
 * التحقق مما إذا كان الفحص حديثًا (أقل من الفترة المحددة)
 */
function isRecentCheck(timestamp: number): boolean {
  return Date.now() - timestamp < CHECK_VALIDITY_PERIOD;
}

/**
 * استرداد نتائج فحص الاتصال المخزنة
 */
function getCachedConnectivityResult(): ConnectivityCheckResult | null {
  try {
    const storedData = sessionStorage.getItem(CONNECTIVITY_STORAGE_KEY);
    if (!storedData) return null;
    
    return JSON.parse(storedData);
  } catch (error) {
    console.warn('خطأ في استرداد بيانات الاتصال المخزنة:', error);
    return null;
  }
}

/**
 * تخزين نتائج فحص الاتصال
 */
function cacheConnectivityResult(result: ConnectivityCheckResult): void {
  try {
    sessionStorage.setItem(CONNECTIVITY_STORAGE_KEY, JSON.stringify(result));
  } catch (error) {
    console.warn('خطأ في تخزين نتائج فحص الاتصال:', error);
  }
}

/**
 * فحص التوافر النسبي للشبكة - تقدير أكثر دقة لجودة الاتصال
 * لا يتم تصديره للحفاظ على نفس API الحالية
 */
async function checkNetworkReliability(): Promise<{
  reliability: 'high' | 'medium' | 'low' | 'none';
  averageResponseTime: number;
  successRate: number;
}> {
  // فحص الاتصال بجميع نقاط النهاية
  const endpoints = await checkEndpointsAccessibility();
  
  // حساب معدل النجاح
  const successRate = endpoints.filter(e => e.success).length / endpoints.length;
  
  // حساب متوسط زمن الاستجابة للنقاط الناجحة
  const successfulEndpoints = endpoints.filter(e => e.success && e.responseTime !== undefined);
  const averageResponseTime = successfulEndpoints.length
    ? successfulEndpoints.reduce((sum, e) => sum + (e.responseTime || 0), 0) / successfulEndpoints.length
    : 0;
  
  // تحديد موثوقية الشبكة بناءً على معدل النجاح ومتوسط زمن الاستجابة
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
