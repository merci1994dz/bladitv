
/**
 * وظائف للتحقق من إمكانية الوصول إلى نقاط النهاية
 * Functions to check endpoint accessibility
 */

import { EndpointCheckResult } from './types';
import { cacheConnectivityResult } from './cache';

/**
 * قائمة نقاط النهاية الافتراضية للتحقق منها
 * Default list of endpoints to check
 */
const DEFAULT_ENDPOINTS = [
  'https://google.com',
  'https://cloudflare.com',
  'https://microsoft.com'
];

/**
 * التحقق من إمكانية الوصول إلى نقاط النهاية المحددة
 * Check accessibility of specified endpoints
 * 
 * @param endpoints قائمة URLs للتحقق منها / List of URLs to check
 * @param timeout مهلة بالمللي ثانية لكل طلب / Timeout in ms for each request
 * @returns مصفوفة من نتائج الاختبار / Array of test results
 */
export async function checkEndpointsAccessibility(
  endpoints: string[] = DEFAULT_ENDPOINTS, 
  timeout: number = 5000
): Promise<EndpointCheckResult[]> {
  console.log('التحقق من إمكانية الوصول إلى نقاط النهاية / Checking endpoints accessibility:', endpoints);
  
  try {
    // إنشاء مصفوفة من وعود لكل نقطة نهاية
    // Create array of promises for each endpoint
    const checkPromises = endpoints.map(url => checkSingleEndpoint(url, timeout));
    
    // انتظار جميع النتائج (حتى الفاشلة)
    // Wait for all results (even failed ones)
    const results = await Promise.all(checkPromises);
    
    // حساب معدل النجاح
    // Calculate success rate
    const successRate = results.filter(r => r.success).length / results.length;
    console.log(`معدل النجاح في فحص نقاط النهاية: ${successRate * 100}% / Endpoint check success rate: ${successRate * 100}%`);
    
    // تخزين نتائج الاختبار في ذاكرة التخزين المؤقت للجلسة
    // Cache test results in session storage
    cacheConnectivityResult({
      hasInternet: successRate > 0,
      hasServerAccess: successRate >= 0.5,
      timestamp: Date.now(),
      endpoints: results
    });
    
    return results;
  } catch (error) {
    console.error('خطأ أثناء التحقق من نقاط النهاية / Error checking endpoints:', error);
    return endpoints.map(url => ({
      url,
      success: false,
      error: String(error)
    }));
  }
}

/**
 * التحقق من إمكانية الوصول إلى نقطة نهاية واحدة
 * Check accessibility of a single endpoint
 * 
 * @param url رابط نقطة النهاية / Endpoint URL
 * @param timeout مهلة بالمللي ثانية / Timeout in ms
 * @returns نتيجة الاختبار / Test result
 */
async function checkSingleEndpoint(url: string, timeout: number): Promise<EndpointCheckResult> {
  console.log(`التحقق من نقطة النهاية: ${url} / Checking endpoint: ${url}`);
  
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // إرسال طلب HEAD فقط للحصول على الرؤوس (أسرع)
      // Send HEAD request only to get headers (faster)
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // أي استجابة تعتبر نجاحًا في وضع no-cors
      // Any response is considered a success in no-cors mode
      return {
        url,
        success: true,
        responseTime
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // في حالة انتهاء المهلة أو أي خطأ آخر
      // In case of timeout or any other error
      return {
        url,
        success: false,
        error: String(error)
      };
    }
  } catch (error) {
    // في حالة حدوث أي استثناء غير متوقع
    // In case of any unexpected exception
    return {
      url,
      success: false,
      error: String(error)
    };
  }
}

/**
 * حساب متوسط وقت الاستجابة للنقاط الناجحة
 * Calculate average response time for successful endpoints
 */
export function calculateAverageResponseTime(results: EndpointCheckResult[]): number {
  const successfulResults = results.filter(r => r.success) as Array<EndpointCheckResult & { responseTime: number }>;
  
  if (successfulResults.length === 0) {
    return 0;
  }
  
  const totalTime = successfulResults.reduce((sum, result) => sum + result.responseTime, 0);
  return totalTime / successfulResults.length;
}

