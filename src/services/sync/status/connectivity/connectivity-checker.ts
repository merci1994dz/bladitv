
/**
 * وظائف للتحقق من حالة الاتصال بالشبكة
 * Functions to check network connectivity status
 */

export const checkConnectivityIssues = async (): Promise<{
  hasInternet: boolean;
  hasServerAccess: boolean;
}> => {
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    return { hasInternet: false, hasServerAccess: false };
  }

  try {
    // تجربة نقاط نهاية متعددة مع مهلة زمنية قصيرة
    const testEndpoints = [
      'https://www.google.com/favicon.ico',
      'https://www.cloudflare.com/favicon.ico',
      'https://cdn.jsdelivr.net/favicon.ico'
    ];
    
    let hasGeneralInternet = false;
    
    for (const endpoint of testEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        hasGeneralInternet = true;
        break;
      } catch (error) {
        console.log(`تعذر الوصول إلى ${endpoint}`);
        continue;
      }
    }
    
    if (!hasGeneralInternet) {
      return { hasInternet: false, hasServerAccess: false };
    }

    // التحقق من الوصول إلى خوادم التطبيق
    const appEndpoints = [
      'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://fastly.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://gcore.jsdelivr.net/gh/bladitv/channels@master/channels.json'
    ];
    
    for (const endpoint of appEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
          mode: 'no-cors'
        });
        
        clearTimeout(timeoutId);
        return { hasInternet: true, hasServerAccess: true };
      } catch (error) {
        continue;
      }
    }
    
    return { hasInternet: true, hasServerAccess: false };
    
  } catch (error) {
    console.error('خطأ في فحص الاتصال:', error);
    return { hasInternet: isOnline, hasServerAccess: false };
  }
};

export const quickConnectivityCheck = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};
