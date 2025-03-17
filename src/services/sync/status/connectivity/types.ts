
/**
 * Types for connectivity checking
 * أنواع البيانات لفحص الاتصال
 */

/**
 * نوع بيانات نتيجة فحص الاتصال
 * Data type for connection check result
 */
export interface ConnectivityCheckResult {
  hasInternet: boolean;
  hasServerAccess: boolean;
  timestamp: number;
  endpoints?: EndpointCheckResult[];
}

/**
 * نتيجة فحص نقطة نهاية واحدة
 * Result of checking a single endpoint
 */
export interface EndpointCheckResult {
  url: string;
  success: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * نتيجة فحص موثوقية الشبكة
 * Result of network reliability check
 */
export interface NetworkReliabilityResult {
  reliability: 'high' | 'medium' | 'low' | 'none';
  averageResponseTime: number;
  successRate: number;
}
