
/**
 * وظائف التخزين المؤقت لنتائج فحص الاتصال
 * Caching functions for connectivity check results
 */

import { ConnectivityCheckResult } from './types';

// مفتاح تخزين نتائج فحص الاتصال في جلسة المتصفح
// Storage key for connection check results in browser session
const CONNECTIVITY_STORAGE_KEY = 'last_connectivity_check';

// مدة صلاحية الاختبار (بالمللي ثانية) - دقيقة واحدة
// Test validity period (in milliseconds) - one minute
export const CHECK_VALIDITY_PERIOD = 60 * 1000;

/**
 * التحقق مما إذا كان الفحص حديثًا (أقل من الفترة المحددة)
 * Check if the check is recent (less than the specified period)
 */
export function isRecentCheck(timestamp: number): boolean {
  return Date.now() - timestamp < CHECK_VALIDITY_PERIOD;
}

/**
 * استرداد نتائج فحص الاتصال المخزنة
 * Retrieve stored connection check results
 */
export function getCachedConnectivityResult(): ConnectivityCheckResult | null {
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
export function cacheConnectivityResult(result: ConnectivityCheckResult): void {
  try {
    sessionStorage.setItem(CONNECTIVITY_STORAGE_KEY, JSON.stringify(result));
  } catch (error) {
    console.warn('خطأ في تخزين نتائج فحص الاتصال: / Error storing connection check results:', error);
  }
}
