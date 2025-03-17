
/**
 * Browser detection and fetch options adjustment
 */

/**
 * Adjusts fetch options based on browser detection and attempt number
 * 
 * @param options Original fetch options
 * @param retryAttempt Current retry attempt number
 * @returns Adjusted fetch options
 */
export const adjustFetchOptionsForBrowser = (options: RequestInit, retryAttempt: number): RequestInit => {
  const adjustedOptions = { ...options };
  const isIE = detectIE();
  const isOldBrowser = detectOldBrowser();
  const isMobile = detectMobile();
  
  // تعديلات للمتصفحات القديمة
  if (isOldBrowser) {
    // المتصفحات القديمة قد تحتاج إلى إزالة بعض الخيارات غير المدعومة
    delete adjustedOptions.cache;
    delete adjustedOptions.integrity;
    delete adjustedOptions.referrerPolicy;
  }
  
  // تعديلات لمتصفح IE
  if (isIE) {
    // IE لا يدعم بعض خيارات fetch
    delete adjustedOptions.integrity;
    delete adjustedOptions.referrerPolicy;
    adjustedOptions.credentials = 'same-origin';
  }
  
  // تعديلات للأجهزة المحمولة
  if (isMobile) {
    // تبسيط الطلبات على الأجهزة المحمولة لتوفير البيانات
    delete adjustedOptions.integrity;
  }
  
  // تعديلات بناءً على رقم المحاولة
  if (retryAttempt <= 3) {
    // في المحاولات الأخيرة، حاول استخدام خيارات أكثر تساهلاً
    adjustedOptions.mode = 'no-cors';
    adjustedOptions.cache = 'no-store';
    adjustedOptions.credentials = 'omit';
  }
  
  return adjustedOptions;
};

/**
 * Detects Internet Explorer
 */
const detectIE = (): boolean => {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE ');
  const trident = ua.indexOf('Trident/');
  
  return msie > 0 || trident > 0;
};

/**
 * Detects old browsers (IE11 and below, old Safari, etc.)
 */
const detectOldBrowser = (): boolean => {
  const ua = window.navigator.userAgent;
  
  // Check for IE
  if (ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0) return true;
  
  // Check for old Safari (before version 10)
  const safariMatch = ua.match(/Version\/(\d+)\.(\d+).*Safari/);
  if (safariMatch && parseInt(safariMatch[1], 10) < 10) return true;
  
  // Check for old Chrome (before version 50)
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch && parseInt(chromeMatch[1], 10) < 50) return true;
  
  // Check for old Firefox (before version 50)
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  if (firefoxMatch && parseInt(firefoxMatch[1], 10) < 50) return true;
  
  return false;
};

/**
 * Detects mobile devices
 */
const detectMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
