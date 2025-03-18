
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
    // تجربة نقطة نهاية واحدة موثوقة مع مهلة قصيرة
    const endpoint = 'https://www.cloudflare.com/cdn-cgi/trace';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      await fetch(endpoint, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.log('فشل الاتصال بالإنترنت');
      return { hasInternet: false, hasServerAccess: false };
    }

    // التحقق من الوصول إلى خوادم التطبيق
    const appEndpoint = 'https://ucmvhjawucyznchetekh.supabase.co/rest/v1/health';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      await fetch(appEndpoint, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        }
      });
      
      clearTimeout(timeoutId);
      return { hasInternet: true, hasServerAccess: true };
    } catch (error) {
      return { hasInternet: true, hasServerAccess: false };
    }
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
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};
