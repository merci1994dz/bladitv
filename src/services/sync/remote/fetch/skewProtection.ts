
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
    if (typeof window !== 'undefined' && isRunningOnVercel()) {
      newHeaders['x-vercel-deployment-url'] = window.location.origin;
      newHeaders['x-vercel-protection-bypass'] = generateProtectionToken();
      
      // حاول استخدام المعلومات المتوفرة عن عملية النشر
      const buildId = localStorage.getItem('vercel_build_id') || '';
      if (buildId) {
        newHeaders['x-vercel-git-commit-sha'] = buildId;
      }
      
      // إضافة معلومات المتصفح لتجنب مشاكل CORS على Vercel
      const userAgent = navigator.userAgent || '';
      if (userAgent) {
        newHeaders['user-agent'] = userAgent;
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
    newHeaders['x-vercel-skip-caching'] = '1';
  } catch (e) {
    // تجاهل أي أخطاء هنا لأنها غير حرجة
    console.warn("تعذر إضافة رؤوس حماية التزامن:", e);
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
    if (typeof window !== 'undefined' && isRunningOnVercel()) {
      params.append('deploymentUrl', window.location.origin);
      
      // حاول استخدام المعلومات المتوفرة عن عملية النشر
      const buildId = localStorage.getItem('vercel_build_id') || '';
      if (buildId) {
        params.append('gitSha', buildId);
      }
      
      // إضافة معلومات الجلسة
      const sessionId = localStorage.getItem('session_id') || generateSessionId();
      params.append('sessionId', sessionId);
    }
    
    // إضافة معرف للزائر
    const visitorId = localStorage.getItem('visitor_id') || generateVisitorId();
    params.append('visitorId', visitorId);
    
    // إضافة وقت الطلب
    params.append('requestedAt', new Date().toISOString());
    
    // إضافة معلومات دورية للمساعدة في منع التخزين المؤقت
    params.append('nocache', Date.now().toString());
    params.append('_', generateRandomId());
    params.append('ts', Date.now().toString());
    params.append('r', generateRandomId());
    params.append('v', Date.now().toString());
    params.append('d', Date.now().toString());
    params.append('rand', generateRandomId());
    params.append('timestamp', new Date().toISOString());
    
    return params.toString();
  } catch (e) {
    console.warn("تعذر إنشاء معلمات حماية التزامن:", e);
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
 * Generates a session ID and stores it in localStorage
 */
const generateSessionId = (): string => {
  const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  try {
    localStorage.setItem('session_id', id);
  } catch (e) {
    // تجاهل أخطاء التخزين
  }
  return id;
};

/**
 * Generates a random ID for cache busting
 */
const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Generates a token for Vercel protection bypass
 */
const generateProtectionToken = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * تحديد ما إذا كان التطبيق يعمل على Vercel
 */
export const isRunningOnVercel = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // التحقق من وجود المعلمات المحددة في عنوان URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('__vercel_deployment_id') || urlParams.has('__vercel')) {
      return true;
    }
    
    // التحقق من اسم المضيف
    if (window.location.hostname.includes('vercel.app')) {
      return true;
    }
    
    // التحقق من وجود علامات Vercel في localStorage
    if (localStorage.getItem('vercel_deployment') === 'true') {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * الحصول على معلومات النشر الخاصة بـ Vercel
 */
export const getVercelDeploymentInfo = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const isVercel = isRunningOnVercel();
    if (!isVercel) return null;
    
    return {
      deploymentUrl: window.location.origin,
      hostname: window.location.hostname,
      buildId: localStorage.getItem('vercel_build_id') || 'unknown',
      lastSync: localStorage.getItem('vercel_last_sync') || 'never',
      realtimeEnabled: localStorage.getItem('vercel_realtime_enabled') === 'true',
      lastRealtimeUpdate: localStorage.getItem('vercel_realtime_update') || null
    };
  } catch (e) {
    console.warn("تعذر الحصول على معلومات نشر Vercel:", e);
    return null;
  }
};
