
/**
 * حماية من الانحراف الزمني
 * Protection against time skew
 */

/**
 * التحقق مما إذا كان التطبيق يعمل على Vercel
 * Check if the application is running on Vercel
 */
export const isRunningOnVercel = (): boolean => {
  // Vercel sets this environment variable
  return typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || 
    localStorage.getItem('is_vercel') === 'true');
};

/**
 * الحصول على معلمات الحماية من الانحراف الزمني
 * Get skew protection parameters
 */
export const getSkewProtectionParams = (): string => {
  if (isRunningOnVercel()) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `_vercel_no_cache=${timestamp}&_vercel_unique=${randomId}`;
  }
  return '';
};

/**
 * إضافة رؤوس الحماية من الانحراف الزمني
 * Add skew protection headers
 */
export const addSkewProtectionHeaders = (headers: Headers): Headers => {
  if (isRunningOnVercel()) {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('X-Vercel-No-Cache', Date.now().toString());
  }
  return headers;
};
