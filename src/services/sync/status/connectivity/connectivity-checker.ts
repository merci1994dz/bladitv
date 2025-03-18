
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
    // استخدام عدة خوادم للتحقق من الاتصال
    const testEndpoints = [
      'https://www.google.com/generate_204',
      'https://www.cloudflare.com/cdn-cgi/trace',
      'https://www.microsoft.com/favicon.ico'
    ];
    
    // نحاول الوصول إلى نقطة نهاية واحدة على الأقل
    let hasGeneralInternet = false;
    
    for (const endpoint of testEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          mode: 'no-cors', // هذا مهم للتغلب على قيود CORS
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        hasGeneralInternet = true;
        break; // نجاح في الوصول إلى إحدى نقاط النهاية
      } catch (error) {
        console.log(`تعذر الوصول إلى ${endpoint}:`, error);
        // نستمر في المحاولة مع النقطة التالية
      }
    }
    
    if (!hasGeneralInternet) {
      return { hasInternet: false, hasServerAccess: false };
    }
    
    // الآن نتحقق من الوصول إلى خوادم التطبيق
    // لنستخدم CDN لتجنب مشاكل CORS
    const appEndpoints = [
      'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://raw.githubusercontent.com/bladitv/channels/master/channels.json'
    ];
    
    for (const endpoint of appEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 204) {
          return { hasInternet: true, hasServerAccess: true };
        }
      } catch (error) {
        console.log(`تعذر الوصول إلى خادم التطبيق ${endpoint}:`, error);
        // نستمر في المحاولة مع النقطة التالية
      }
    }
    
    // الوصول إلى الإنترنت محدود، لكن لا يمكن الوصول إلى خوادم التطبيق
    return { hasInternet: true, hasServerAccess: false };
  } catch (error) {
    console.log('خطأ في فحص الاتصال بالإنترنت:', error);
    
    // في حالة حدوث خطأ، نفترض أن هناك اتصالًا محدودًا بالإنترنت
    return { hasInternet: isOnline, hasServerAccess: false };
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
    // نحاول الوصول بشكل بسيط إلى موارد معروفة
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      await fetch('https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json', {
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // نحاول مرة أخرى مع نقطة نهاية أخرى
      const backupController = new AbortController();
      const backupTimeoutId = setTimeout(() => backupController.abort(), 3000);
      
      try {
        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          cache: 'no-store',
          mode: 'no-cors',
          signal: backupController.signal
        });
        
        clearTimeout(backupTimeoutId);
        return true;
      } catch (backupError) {
        clearTimeout(backupTimeoutId);
        return false;
      }
    }
  } catch (error) {
    return false;
  }
};
