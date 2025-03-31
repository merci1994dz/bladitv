
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
  
  // التحقق من الوصول إلى الخادم (يمكن تنفيذ فحص أكثر تفصيلاً)
  let hasServerAccess = false;
  
  if (hasInternet) {
    try {
      // محاولة إرسال طلب بسيط للتحقق من الوصول إلى الخادم
      const testEndpoint = 'https://www.google.com';
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
      hasServerAccess = true;
    } catch (error) {
      console.error('خطأ في التحقق من الاتصال بالخادم:', error);
      hasServerAccess = false;
    }
  }
  
  return { hasInternet, hasServerAccess };
};
