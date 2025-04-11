
/**
 * استراتيجيات إعادة المحاولة للاتصالات مع المصادر الخارجية
 * Retry strategies for communications with external sources
 */

/**
 * إنشاء معامل كسر التخزين المؤقت
 * Create cache busting parameters
 */
export const createCacheBuster = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const secondRandom = Math.random().toString(36).substring(2, 15);
  return `nocache=${timestamp}&_=${random}&ts=${timestamp}&r=${random}&v=${timestamp}&d=${Date.now()}&rand=${secondRandom}&timestamp=${new Date().toISOString()}&version=${process.env.REACT_APP_VERSION || timestamp}`;
};

/**
 * إضافة معلمات كسر التخزين المؤقت إلى الرابط
 * Add cache busting parameters to URL
 */
export const addCacheBusterToUrl = (url: string): string => {
  // حذف أي معلمات سابقة لمنع التخزين المؤقت
  let baseUrl = url;
  
  // التحقق مما إذا كان الرابط يحتوي على # وإزالته
  if (baseUrl.includes('#')) {
    baseUrl = baseUrl.split('#')[0];
  }
  
  if (baseUrl.includes('?')) {
    // إزالة فقط معلمات التخزين المؤقت السابقة إذا وجدت
    const urlParts = baseUrl.split('?');
    const path = urlParts[0];
    const queryParams = urlParts[1].split('&').filter(param => 
      !param.startsWith('nocache=') && 
      !param.startsWith('_=') && 
      !param.startsWith('ts=') && 
      !param.startsWith('r=') && 
      !param.startsWith('v=') &&
      !param.startsWith('d=') &&
      !param.startsWith('rand=') &&
      !param.startsWith('timestamp=') &&
      !param.startsWith('version=')
    ).join('&');
    
    baseUrl = queryParams.length > 0 ? `${path}?${queryParams}` : path;
  }
  
  // إضافة معلمات إضافية لمنع التخزين المؤقت (تشمل طوابع زمنية وأرقام عشوائية)
  const cacheParam = createCacheBuster();
  const urlWithCache = baseUrl.includes('?') 
    ? `${baseUrl}&${cacheParam}` 
    : `${baseUrl}?${cacheParam}`;
  
  // إضافة معرف زائر لتتبع الطلبات
  const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // إضافة وقت الطلب بتنسيق ISO
  const requestedAt = new Date().toISOString();
  
  // إنشاء الرابط النهائي
  return `${urlWithCache}&visitorId=${visitorId}&requestedAt=${encodeURIComponent(requestedAt)}`;
};

/**
 * الانتظار مع تأخير متزايد
 * Wait with exponential backoff
 */
export const exponentialBackoff = async (attempt: number): Promise<void> => {
  const backoffTime = Math.min(
    Math.pow(2, attempt) * 1000 + Math.random() * 1000,
    15000 // الحد الأقصى هو 15 ثانية
  );
  console.log(`الانتظار ${backoffTime}ms قبل المحاولة التالية...`);
  await new Promise(resolve => setTimeout(resolve, backoffTime));
};

/**
 * إنشاء علامات فريدة لمنع التخزين المؤقت
 * Create unique markers to prevent caching
 */
export const createUniqueMarkers = (): Record<string, string> => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  
  return {
    'force_browser_refresh': 'true',
    'nocache_version': timestamp,
    'data_version': timestamp,
    'force_update': 'true',
    'cache_bust_time': timestamp,
    'hard_refresh_trigger': 'true',
    'refresh_marker': `${timestamp}_${random}`,
    'aggressive_cache_bust': 'true',
    'total_cache_clear': 'true',
    'clear_page_cache': 'true',
    'app_updated_time': timestamp
  };
};

/**
 * تطبيق علامات منع التخزين المؤقت على التخزين المحلي
 * Apply cache prevention markers to local storage
 */
export const applyStorageMarkers = (): void => {
  const markers = createUniqueMarkers();
  
  Object.entries(markers).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    } catch (e) {
      // تجاهل أي أخطاء
      console.warn('خطأ في تطبيق علامات التخزين:', e);
    }
  });
};

/**
 * تطبيق قوي لمنع التخزين المؤقت في جميع الطلبات
 * Aggressive cache prevention for all requests
 */
export const preventCacheForAllRequests = (): void => {
  // تطبيق علامات التخزين المحلي
  applyStorageMarkers();
  
  // محاولة إضافة رؤوس لمنع التخزين المؤقت لجميع الطلبات المستقبلية
  try {
    // إعادة تعريف طريقة fetch الافتراضية
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      // إنشاء نسخة من خيارات الطلب
      const newInit = init || {};
      
      // إضافة رؤوس لمنع التخزين المؤقت
      newInit.headers = {
        ...newInit.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Timestamp': Date.now().toString(),
        'X-Random': Math.random().toString(36).substring(2, 15)
      };
      
      // تطبيق خيار لمنع التخزين المؤقت
      newInit.cache = 'no-store';
      
      // إضافة معلمات لمنع التخزين المؤقت إلى URL إذا كان نصيًا
      if (typeof input === 'string') {
        input = addCacheBusterToUrl(input);
      }
      
      // استدعاء طريقة fetch الأصلية
      return originalFetch.call(window, input, newInit);
    };
    
    console.log('تم تفعيل منع التخزين المؤقت لجميع الطلبات');
  } catch (e) {
    console.warn('فشل في تطبيق منع التخزين المؤقت لجميع الطلبات:', e);
  }
};
