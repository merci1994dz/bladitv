
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
      'https://www.microsoft.com/favicon.ico',
      'https://httpbin.org/ip', // إضافة نقطة نهاية إضافية
      'https://raw.githubusercontent.com/bladitv/status/main/ping.txt' // مصدر مخصص
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
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
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
    // استخدام مجموعة أكبر من نقاط النهاية لتجنب مشاكل CORS والحجب
    const appEndpoints = [
      'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://raw.githubusercontent.com/bladitv/channels/master/channels.json',
      'https://api.github.com/repos/bladitv/channels/contents/channels.json',
      'https://bladitv.github.io/channels/channels.json',
      'https://fastly.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://gcore.jsdelivr.net/gh/bladitv/channels@master/channels.json'
    ];
    
    // استخدام Promise.race مع timeout بدلاً من Promise.any
    // Using Promise.race with timeout instead of Promise.any for better compatibility
    try {
      // إنشاء مصفوفة من الوعود للتحقق من كل نقطة نهاية
      const checkPromises = appEndpoints.map(endpoint => {
        return new Promise(async (resolve, reject) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
              reject(new Error(`Timeout for ${endpoint}`));
            }, 3000); // وقت انتظار أقصر لكل طلب
            
            const response = await fetch(endpoint, {
              method: 'HEAD',
              cache: 'no-store',
              signal: controller.signal,
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok || response.status === 204) {
              resolve(true);
            } else {
              reject(new Error(`Status ${response.status} for ${endpoint}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      // تنفيذ جميع الوعود وانتظار أي نتيجة ناجحة
      // Run all promises and look for any successful result
      const results = await Promise.allSettled(checkPromises);
      const hasSuccessfulEndpoint = results.some(result => result.status === 'fulfilled');
      
      return { 
        hasInternet: true, 
        hasServerAccess: hasSuccessfulEndpoint 
      };
    } catch (error) {
      console.log('فشل الوصول إلى جميع نقاط نهاية التطبيق:', error);
      return { hasInternet: true, hasServerAccess: false };
    }
    
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
    // نحاول الوصول بشكل بسيط إلى مجموعة من الموارد المعروفة
    // استخدام خوادم متعددة لزيادة فرص النجاح
    const quickEndpoints = [
      'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://www.google.com/generate_204',
      'https://fastly.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://httpbin.org/ip'
    ];
    
    // التحقق بشكل متوازٍ من جميع نقاط النهاية
    const allPromises = quickEndpoints.map(endpoint => {
      return new Promise<boolean>(async (resolve) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            resolve(false);
          }, 2000); // وقت انتظار أقصر للفحص السريع
          
          await fetch(endpoint, {
            method: 'HEAD',
            cache: 'no-store',
            mode: 'no-cors',
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          resolve(true);
        } catch (error) {
          resolve(false);
        }
      });
    });
    
    // انتظار كافة الوعود واختيار أفضل نتيجة
    const results = await Promise.all(allPromises);
    return results.some(result => result === true);
    
  } catch (error) {
    return false;
  }
};
