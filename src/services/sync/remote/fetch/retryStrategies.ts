
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
  return `nocache=${timestamp}&_=${random}&ts=${timestamp}&r=${random}&v=${timestamp}`;
};

/**
 * إضافة معلمات كسر التخزين المؤقت إلى الرابط
 * Add cache busting parameters to URL
 */
export const addCacheBusterToUrl = (url: string): string => {
  // حذف أي معلمات سابقة لمنع التخزين المؤقت
  let baseUrl = url;
  if (baseUrl.includes('?')) {
    // إزالة فقط معلمات التخزين المؤقت السابقة إذا وجدت
    const urlParts = baseUrl.split('?');
    const path = urlParts[0];
    const queryParams = urlParts[1].split('&').filter(param => 
      !param.startsWith('nocache=') && 
      !param.startsWith('_=') && 
      !param.startsWith('ts=') && 
      !param.startsWith('r=') && 
      !param.startsWith('v=')
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
