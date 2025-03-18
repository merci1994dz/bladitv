
/**
 * ملف الفهرس المحسن لوظائف جلب البيانات
 * Optimized index file for data fetching functions
 */

// تصدير الوظائف الرئيسية
export { fetchRemoteData, isRemoteUrlAccessible } from './fetchRemoteData';
export { getSkewProtectionParams } from './skewProtection';
export { fetchViaJsonp } from './jsonpFallback';

// تصدير الوظائف المساعدة للاستخدام المباشر إذا لزم الأمر
export { addCacheBusterToUrl, createCacheBuster, exponentialBackoff } from './retryStrategies';
export { fetchViaProxy, getAlternativeSourceUrl } from './proxyUtils';
export { enhanceFetchError, isConnectivityError, getUserFriendlyErrorMessage } from './errorHandling';
export { fetchLocalFile } from './localFetch';
export { tryProxyStrategy, fetchDirectly, fetchWithFlexibleFormat } from './fetchStrategies';
