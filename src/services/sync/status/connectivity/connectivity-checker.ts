
/**
 * وظائف فحص الاتصال
 * Connectivity checking functions
 */

/**
 * التحقق من وجود مشاكل في الاتصال
 * Check for connectivity issues
 */
export const checkConnectivityIssues = async (): Promise<{
  hasInternet: boolean;
  hasServerAccess: boolean;
}> => {
  // التحقق من اتصال الإنترنت
  const hasInternet = navigator.onLine;
  
  // التحقق من الوصول إلى الخادم
  let hasServerAccess = false;
  
  if (hasInternet) {
    // استخدام طريقة أكثر موثوقية للتحقق من اتصال الخادم
    try {
      // محاولة التحقق من اتصال الخادم باستخدام مصادر متعددة
      // في حالة فشل أحدها سنحاول مع آخر
      const serverConnectAttempts = [
        testEndpointAvailability('https://www.google.com'), 
        testEndpointAvailability('https://www.cloudflare.com')
      ];
      
      // انتظار أول استجابة ناجحة أو فشل جميع المحاولات
      const results = await Promise.allSettled(serverConnectAttempts);
      
      // إذا نجحت أي محاولة، نعتبر أن هناك اتصال بالخادم
      hasServerAccess = results.some(result => result.status === 'fulfilled' && result.value === true);
      
      console.debug(`حالة الاتصال: الإنترنت=${hasInternet}, الخادم=${hasServerAccess}`);
    } catch (error) {
      console.error('خطأ أثناء التحقق من حالة الاتصال:', error);
      hasServerAccess = false;
    }
  }
  
  return { hasInternet, hasServerAccess };
};

/**
 * اختبار توفر نقطة نهاية محددة
 * Test specific endpoint availability
 */
export const testEndpointAvailability = async (
  testEndpoint: string = 'https://www.google.com'
): Promise<boolean> => {
  try {
    // تحسين: استخدام متغير مهلة واستخدام race لمنع انتظار طويل
    const timeoutMs = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    // محاولة إرسال طلب بسيط للتحقق من الوصول إلى الخادم
    const response = await fetch(testEndpoint, {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors', // استخدام وضع no-cors لتجنب أخطاء CORS
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    clearTimeout(timeoutId);
    
    // إذا تم إكمال الطلب، نعتبر أن هناك اتصالاً بالخادم
    return true;
  } catch (error) {
    // تحسين: تسجيل الخطأ المحدد للتشخيص
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn(`اختبار الاتصال مع ${testEndpoint} تجاوز المهلة المحددة`);
    } else {
      console.error(`خطأ في التحقق من الاتصال بـ ${testEndpoint}:`, error);
    }
    return false;
  }
};

/**
 * فحص الاتصال بالخادم
 * Check server connection
 */
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const { hasInternet, hasServerAccess } = await checkConnectivityIssues();
    return hasInternet && hasServerAccess;
  } catch (error) {
    console.error('فشل في الاتصال بالخادم:', error);
    return false;
  }
};

/**
 * فحص ما إذا كان كل من الإنترنت والخادم متاح
 * Check if both internet and server are available
 */
export const isConnected = async (): Promise<boolean> => {
  const { hasInternet, hasServerAccess } = await checkConnectivityIssues();
  return hasInternet && hasServerAccess;
};
