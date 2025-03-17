
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
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      newHeaders['x-vercel-deployment-url'] = process.env.VERCEL_URL || '';
      newHeaders['x-vercel-git-commit-sha'] = process.env.VERCEL_GIT_COMMIT_SHA;
    }
    
    // إضافة معرف للزائر لتتبع المزامنة
    const visitorId = localStorage.getItem('visitor_id') || generateVisitorId();
    newHeaders['x-visitor-id'] = visitorId;
    
    // إضافة رأس لتجنب التخزين المؤقت
    newHeaders['x-requested-at'] = new Date().toISOString();
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
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      params.append('deploymentUrl', process.env.VERCEL_URL || '');
      params.append('gitSha', process.env.VERCEL_GIT_COMMIT_SHA);
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
