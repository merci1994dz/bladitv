
/**
 * فحص إمكانية الوصول إلى نقاط النهاية المختلفة
 * Check accessibility of different endpoints
 */

import { createProgressiveRetryStrategy, retry } from '@/utils/retryStrategy';
import { EndpointCheckResult } from './types';

// العناوين المستخدمة لاختبار الاتصال بالإنترنت والخوادم
// Endpoints used to test internet connection and server accessibility
export const CONNECTIVITY_CHECK_ENDPOINTS = [
  'https://bladitv.lovable.app/ping',
  'https://bladi-info.com/ping',
  'https://bladiinfo-api.vercel.app/ping',
  'https://bladiinfo-backup.netlify.app/ping',
  'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/ping'
];

/**
 * فحص إمكانية الوصول إلى نقاط النهاية المختلفة بشكل متوازي
 * Check accessibility of different endpoints in parallel
 * with retry attempts and performance statistics
 */
export async function checkEndpointsAccessibility(): Promise<EndpointCheckResult[]> {
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
      const aTime = a.responseTime || Number.MAX_SAFE_INTEGER;
      const bTime = b.responseTime || Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    }
    
    return 0;
  });
}
