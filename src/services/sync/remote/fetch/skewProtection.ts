
/**
 * حماية انحراف التزامن لمنع المشاكل في البيئات المختلفة
 * Sync skew protection to prevent issues in different environments
 */

/**
 * التحقق مما إذا كان التطبيق يعمل على Vercel
 * Check if the app is running on Vercel
 */
export const isRunningOnVercel = (): boolean => {
  // تحقق من وجود متغيرات Vercel البيئية المعروفة
  // Check for known Vercel environment variables
  const isVercelEnv = typeof process !== 'undefined' && 
                      (process.env.VERCEL || 
                       process.env.VERCEL_ENV || 
                       process.env.NEXT_PUBLIC_VERCEL_ENV);
  
  // تحقق من الـ URL للتأكد من أن الموقع يستضاف على Vercel
  // Check URL to confirm site is hosted on Vercel
  const isVercelDomain = typeof window !== 'undefined' && 
                         (window.location.hostname.endsWith('.vercel.app') || 
                          window.location.hostname.includes('vercel-analytics'));
  
  // تحقق من localStorage لاكتشاف ما إذا كنا قد حددناه مسبقًا
  // Check localStorage to see if we've determined it previously
  const storedVercelFlag = typeof window !== 'undefined' && 
                          window.localStorage && 
                          window.localStorage.getItem('vercel_deployment') === 'true';
  
  return Boolean(isVercelEnv || isVercelDomain || storedVercelFlag);
};

/**
 * الحصول على معلمات حماية انحراف التزامن
 * Get sync skew protection parameters
 */
export const getSkewProtectionParams = (): string | null => {
  if (isRunningOnVercel()) {
    // إضافة معلمات خاصة ببيئة Vercel
    // Add Vercel-specific parameters
    const vercelBuildId = process.env.VERCEL_GIT_COMMIT_SHA || 
                          process.env.VERCEL_GITHUB_COMMIT_SHA || 
                          'unknown-vercel-build';
    return `vercel=true&buildId=${vercelBuildId}`;
  }
  
  return null;
};
