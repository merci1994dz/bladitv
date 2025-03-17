
/**
 * مسؤول عن فحص حالة الاتصال والتحقق من الوصول إلى الخوادم
 */

/**
 * فحص ما إذا كانت هناك أي مشاكل اتصال تعرقل المزامنة
 */
export const checkConnectivityIssues = async (): Promise<{ hasInternet: boolean, hasServerAccess: boolean }> => {
  // التحقق من وجود اتصال بالإنترنت
  const hasInternet = navigator.onLine;
  
  // التحقق من القدرة على الوصول إلى الخادم
  let hasServerAccess = false;
  
  if (hasInternet) {
    try {
      // محاولة الوصول إلى الخادم الرئيسي باستخدام طلب بسيط
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // تجربة المواقع المختلفة بشكل متوازي لتحسين الأداء
      const urls = [
        'https://bladitv.lovable.app/ping',
        'https://bladi-info.com/ping',
        'https://bladiinfo-api.vercel.app/ping',
        'https://bladiinfo-backup.netlify.app/ping',
        'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/ping'
      ];
      
      const connectionChecks = urls.map(url => 
        fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        .then(response => response.ok)
        .catch(() => false)
      );
      
      // انتظار حتى تنجح إحدى الطلبات أو تفشل جميعها
      const results = await Promise.allSettled(connectionChecks);
      
      clearTimeout(timeoutId);
      
      // إذا نجح أي طلب، فهناك وصول للخادم
      hasServerAccess = results.some(result => 
        result.status === 'fulfilled' && result.value === true
      );
      
      // حفظ نتيجة الاتصال للاستخدام لاحقاً
      try {
        sessionStorage.setItem('last_connectivity_check', JSON.stringify({
          hasInternet,
          hasServerAccess,
          timestamp: Date.now()
        }));
      } catch (e) {
        // تجاهل أخطاء التخزين
      }
    } catch (error) {
      console.warn('تعذر الوصول إلى خوادم المزامنة:', error);
      hasServerAccess = false;
    }
  }
  
  // تحسين الأداء: استخدام القيم المخزنة إذا كان الفحص الأخير حديثًا (أقل من دقيقة)
  if (!hasServerAccess) {
    try {
      const lastCheckStr = sessionStorage.getItem('last_connectivity_check');
      if (lastCheckStr) {
        const lastCheck = JSON.parse(lastCheckStr);
        const isRecent = Date.now() - lastCheck.timestamp < 60000; // أقل من دقيقة
        
        if (isRecent && lastCheck.hasServerAccess) {
          hasServerAccess = true;
        }
      }
    } catch (e) {
      // تجاهل أخطاء التخزين
    }
  }
  
  return { hasInternet, hasServerAccess };
};
