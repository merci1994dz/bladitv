
/**
 * وظائف حماية التزامن وتحديد بيئة التشغيل
 * Skew protection and environment detection functions
 */

/**
 * الحصول على معلمات حماية التزامن
 * Get skew protection parameters
 */
export const getSkewProtectionParams = (): Record<string, string> => {
  try {
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 15);
    
    return {
      'ts': timestamp.toString(),
      'r': randomValue,
      'v': timestamp.toString()
    };
  } catch (error) {
    console.error('خطأ في الحصول على معلمات حماية التزامن:', error);
    return {};
  }
};

/**
 * التحقق مما إذا كان التطبيق يعمل على Vercel
 * Check if the app is running on Vercel
 */
export const isRunningOnVercel = (): boolean => {
  try {
    // التحقق من الرابط
    // Check URL
    const url = window.location.hostname;
    
    return url.includes('vercel.app') || 
           url.includes('now.sh') || 
           document.cookie.includes('__vercel');
  } catch (error) {
    console.error('خطأ في التحقق مما إذا كان التطبيق يعمل على Vercel:', error);
    return false;
  }
};

/**
 * إضافة رؤوس حماية التزامن
 * Add skew protection headers
 */
export const addSkewProtectionHeaders = (headers: Record<string, string>): Record<string, string> => {
  try {
    const skewParams = getSkewProtectionParams();
    
    // إضافة معلمات حماية التزامن إلى الرؤوس
    // Add skew protection parameters to headers
    return {
      ...headers,
      'X-Timestamp': skewParams.ts,
      'X-Random': skewParams.r,
      'X-Version': skewParams.v
    };
  } catch (error) {
    console.error('خطأ في إضافة رؤوس حماية التزامن:', error);
    return headers;
  }
};
