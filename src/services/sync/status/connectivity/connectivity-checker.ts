
/**
 * وظائف للتحقق من حالة الاتصال بالشبكة
 * Functions to check network connectivity status
 */

/**
 * التحقق من قضايا الاتصال المحتملة
 * Check potential connectivity issues
 */
export const checkConnectivityIssues = async (): Promise<{
  hasInternet: boolean;
  hasServerAccess: boolean;
}> => {
  const isOnline = navigator.onLine;
  
  // إذا لم يكن هناك اتصال أساسي، لا داعي لإجراء المزيد من الفحوصات
  // If there's no basic connection, no need for further checks
  if (!isOnline) {
    return { hasInternet: false, hasServerAccess: false };
  }

  // التحقق من الوصول إلى خوادم معروفة
  // Check access to known servers
  try {
    // استخدام AbortController بدلاً من .timeout()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // محاولة إجراء طلب بسيط إلى موقع خارجي موثوق
    // Attempt a simple request to a reliable external site
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // إذا كان الرد ناجحًا، نتحقق من الوصول إلى الخادم المستهدف
    // If the response is successful, check access to the target server
    if (response.ok || response.status === 204) {
      try {
        // فحص الوصول إلى خادم التطبيق
        // Check access to app server
        const serverController = new AbortController();
        const serverTimeoutId = setTimeout(() => serverController.abort(), 5000);
        
        // اختبار الوصول إلى نقطة نهاية بسيطة في الخادم المستهدف
        // Test access to a simple endpoint on the target server
        const serverResponse = await fetch('https://bladitv.lovable.app/ping', {
          method: 'HEAD',
          cache: 'no-store',
          signal: serverController.signal
        });
        
        clearTimeout(serverTimeoutId);
        return { 
          hasInternet: true, 
          hasServerAccess: serverResponse.ok 
        };
      } catch (serverError) {
        console.log('تعذر الوصول إلى خادم التطبيق:', serverError);
        return { hasInternet: true, hasServerAccess: false };
      }
    }
    
    // الوصول إلى الإنترنت محدود
    // Internet access is limited
    return { hasInternet: true, hasServerAccess: false };
  } catch (error) {
    console.log('خطأ في فحص الاتصال بالإنترنت:', error);
    
    // في حالة حدوث خطأ، نفترض أن هناك اتصالًا بالإنترنت ولكن لا يمكن الوصول إلى الخادم
    // In case of error, assume there's internet but no server access
    return { hasInternet: true, hasServerAccess: false };
  }
};

/**
 * فحص بسيط لحالة الاتصال - نسخة أخف وأسرع
 * Simple connectivity check - lighter and faster version
 */
export const quickConnectivityCheck = async (): Promise<boolean> => {
  // التحقق من حالة الاتصال الأساسية
  // Check basic connectivity status
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // استخدام عنوان URL بسيط ورد سريع
    // Use a simple URL with fast response
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 204;
  } catch (error) {
    return false;
  }
};
