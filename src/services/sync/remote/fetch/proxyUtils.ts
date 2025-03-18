
/**
 * أدوات استخدام خدمات البروكسي CORS للتغلب على قيود CORS
 * CORS proxy utility functions to overcome CORS restrictions
 */

const PROXY_SERVICES = [
  {
    name: 'corsproxy.io',
    url: 'https://corsproxy.io/?',
    encode: (url: string) => encodeURIComponent(url),
    maxRetries: 2
  },
  {
    name: 'allorigins.win',
    url: 'https://api.allorigins.win/raw?url=',
    encode: (url: string) => encodeURIComponent(url),
    maxRetries: 2
  },
  {
    name: 'cors.sh',
    url: 'https://proxy.cors.sh/',
    encode: (url: string) => url,
    maxRetries: 2
  },
  // الخدمات الاحتياطية
  {
    name: 'cors-anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    encode: (url: string) => url,
    maxRetries: 1
  }
];

/**
 * محاولة جلب البيانات عبر خدمة بروكسي CORS
 * Attempt to fetch data via a CORS proxy service
 */
export const fetchViaProxy = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // الاحتفاظ بقائمة أخطاء الخدمات التي تم تجربتها
  const errors: Error[] = [];
  
  // تجربة كل خدمة بروكسي مع تكرار المحاولات إذا لزم الأمر
  for (const proxyService of PROXY_SERVICES) {
    let retriesLeft = proxyService.maxRetries;
    
    while (retriesLeft > 0) {
      try {
        console.log(`محاولة استخدام بروكسي CORS: ${proxyService.url}${proxyService.encode(url)}`);
        
        // إضافة خيارات إضافية للتحكم في التخزين المؤقت
        const fetchOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Requested-With': 'XMLHttpRequest'
          }
        };
        
        // استخدام AbortController لتجنب التعليق لفترة طويلة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        fetchOptions.signal = controller.signal;
        
        // محاولة الجلب عبر البروكسي
        const response = await fetch(`${proxyService.url}${proxyService.encode(url)}`, fetchOptions);
        
        // إلغاء المؤقت لتجنب التسريب
        clearTimeout(timeoutId);
        
        // التحقق من نجاح الاستجابة
        if (response.ok) {
          console.log(`نجح استخدام بروكسي ${proxyService.name}`);
          return response;
        } else {
          console.warn(`فشل استخدام بروكسي ${proxyService.name}: ${response.status} ${response.statusText}`);
          retriesLeft--;
        }
      } catch (error) {
        console.warn(`فشل استخدام بروكسي ${proxyService.name}:`, error);
        errors.push(error as Error);
        retriesLeft--;
      }
      
      // انتظار قبل إعادة المحاولة
      if (retriesLeft > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.warn('فشلت محاولات البروكسي');
  throw new Error('فشلت جميع محاولات البروكسي CORS');
};

/**
 * التحقق مما إذا كان عنوان URL يمكن الوصول إليه
 * Check if a URL is accessible
 */
export const isProxyRequired = async (url: string): Promise<boolean> => {
  try {
    // محاولة جلب مباشرة بدون أي بيانات كاملة
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    return false; // لا يلزم وجود بروكسي
  } catch (error) {
    // الجلب المباشر فشل، يلزم وجود بروكسي
    return true;
  }
};
