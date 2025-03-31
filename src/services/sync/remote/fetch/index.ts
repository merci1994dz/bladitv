
/**
 * وظائف جلب البيانات من المصادر الخارجية
 * Functions for fetching data from external sources
 */

export { fetchRemoteData, isRemoteUrlAccessible } from './fetchRemoteData';
export { getSkewProtectionParams, isRunningOnVercel, addSkewProtectionHeaders } from './skewProtection';
