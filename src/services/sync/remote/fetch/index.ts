
/**
 * ملف الفهرس المحسن لوظائف جلب البيانات
 * Optimized index file for data fetching functions
 */

// تصدير الوظائف الرئيسية
export { fetchRemoteData } from './fetchRemoteData';
export { isRemoteUrlAccessible } from './accessibilityCheck';
export { getSkewProtectionParams } from './skewProtection';
export { loadWithJsonp } from './jsonpFallback';

// تصدير الوظائف المساعدة للاستخدام المباشر إذا لزم الأمر
export { addCacheBusterToUrl, createCacheBuster, exponentialBackoff } from './retryStrategies';
export { fetchViaProxy, getProxyUrls } from './proxyUtils';
export { enhanceFetchError, processResponseError } from './errorHandling';
export { fetchLocalFile } from './localFetch';
export { tryDirectFetchStrategy, tryJsonpStrategy, tryProxyStrategy } from './fetchStrategies';
