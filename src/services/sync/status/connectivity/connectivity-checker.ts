
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
    hasServerAccess = await testEndpointAvailability('https://www.google.com');
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
    // محاولة إرسال طلب بسيط للتحقق من الوصول إلى الخادم
    const response = await fetch(testEndpoint, {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors', // استخدام وضع no-cors لتجنب أخطاء CORS
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // إذا تم إكمال الطلب، نعتبر أن هناك اتصالاً بالخادم
    return true;
  } catch (error) {
    console.error('خطأ في التحقق من الاتصال بالخادم:', error);
    return false;
  }
};

/**
 * فحص الاتصال بالخادم
 * Check server connection
 */
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    return await testEndpointAvailability();
  } catch (error) {
    console.error('فشل في الاتصال بالخادم:', error);
    return false;
  }
};
