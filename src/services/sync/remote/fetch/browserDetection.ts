
/**
 * Browser detection utilities
 */

/**
 * Detect browser type for compatibility adjustments
 * 
 * @returns Object with browser detection flags
 */
export const detectBrowser = () => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
  const isEdge = !isIE && !!(window as any).StyleMedia;
  
  return {
    isSafari,
    isIE,
    isEdge
  };
};

/**
 * Adjust fetch options based on browser type
 * 
 * @param fetchOptions Original fetch options
 * @param retryCount Current retry attempt number
 * @returns Adjusted fetch options
 */
export const adjustFetchOptionsForBrowser = (
  fetchOptions: RequestInit,
  retryCount: number
): RequestInit => {
  const { isSafari, isIE, isEdge } = detectBrowser();
  
  // Create a new options object to avoid modifying the original
  const adjustedOptions = { ...fetchOptions };
  
  // تكييف خيارات الطلب للمتصفحات المختلفة
  if (isSafari || isIE || isEdge) {
    // في بعض المتصفحات، قد نحتاج لتبسيط الخيارات
    delete adjustedOptions.cache;
    
    // نضيف إضافة no-cors mode للمحاولات الأخيرة
    if (retryCount <= 2) {
      adjustedOptions.mode = 'no-cors';
      console.log('استخدام وضع no-cors للمتصفحات المتوافقة');
    }
  }
  
  return adjustedOptions;
};
