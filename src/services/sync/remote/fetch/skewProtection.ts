
/**
 * Adds skew protection headers to fetch requests
 * These headers help with Vercel's Skew Protection
 */

/**
 * Adds skew protection headers to the provided headers object
 * 
 * @param headers Original headers object
 * @returns Headers object with added skew protection
 */
export const addSkewProtectionHeaders = (headers: Record<string, string>): Record<string, string> => {
  const newHeaders = { ...headers };
  
  // تجنب تقييد الوصول بسبب حماية التزامن في Vercel
  try {
    // إضافة معرفات البناء والنشر إذا كانت متوفرة
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      newHeaders['x-vercel-deployment-url'] = window.location.origin;
      
      // حاول استخدام المعلومات المتوفرة عن عملية النشر
      const buildId = localStorage.getItem('vercel_build_id') || '';
      if (buildId) {
        newHeaders['x-vercel-git-commit-sha'] = buildId;
      }
    }
    
    // إضافة معرف للزائر لتتبع المزامنة
    const visitorId = localStorage.getItem('visitor_id') || generateVisitorId();
    newHeaders['x-visitor-id'] = visitorId;
    
    // إضافة رأس لتجنب التخزين المؤقت
    newHeaders['x-requested-at'] = new Date().toISOString();
    
    // إضافة رؤوس خاصة بـ Vercel للمساعدة في تجنب مشاكل CORS
    newHeaders['x-middleware-preflight'] = '1';
    newHeaders['x-vercel-skip-middleware'] = '1';
  } catch (e) {
    // تجاهل أي أخطاء هنا لأنها غير حرجة
  }
  
  return newHeaders;
};

/**
 * Generates skew protection parameters for URL queries
 */
export const getSkewProtectionParams = (): string => {
  try {
    const params = new URLSearchParams();
    
    // إضافة معرفات النشر إذا كانت متوفرة
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      params.append('deploymentUrl', window.location.origin);
      
      // حاول استخدام المعلومات المتوفرة عن عملية النشر
      const buildId = localStorage.getItem('vercel_build_id') || '';
      if (buildId) {
        params.append('gitSha', buildId);
      }
    }
    
    // إضافة معرف للزائر
    const visitorId = localStorage.getItem('visitor_id') || generateVisitorId();
    params.append('visitorId', visitorId);
    
    // إضافة وقت الطلب
    params.append('requestedAt', new Date().toISOString());
    
    return params.toString();
  } catch (e) {
    return '';
  }
};

/**
 * Generates a visitor ID and stores it in localStorage
 */
const generateVisitorId = (): string => {
  const id = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  try {
    localStorage.setItem('visitor_id', id);
  } catch (e) {
    // تجاهل أخطاء التخزين
  }
  return id;
};

/**
 * تحديد ما إذا كان التطبيق يعمل على Vercel
 */
export const isRunningOnVercel = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('vercel.app');
};

/**
 * الحصول على معلومات النشر الخاصة بـ Vercel
 */
export const getVercelDeploymentInfo = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const isVercel = window.location.hostname.includes('vercel.app');
    if (!isVercel) return null;
    
    return {
      deploymentUrl: window.location.origin,
      hostname: window.location.hostname,
      buildId: localStorage.getItem('vercel_build_id') || 'unknown'
    };
  } catch (e) {
    return null;
  }
};
