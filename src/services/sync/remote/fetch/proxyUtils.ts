
/**
 * أدوات استخدام خدمات البروكسي CORS للتغلب على قيود CORS
 * CORS proxy utility functions to overcome CORS restrictions
 */

const PROXY_SERVICES = [
  {
    name: 'crossorigin.me',
    url: 'https://crossorigin.me/',
    encode: (url: string) => url,
    maxRetries: 2
  },
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
    name: 'thingproxy',
    url: 'https://thingproxy.freeboard.io/fetch/',
    encode: (url: string) => url,
    maxRetries: 1
  },
  {
    name: 'github-jsdelivr',
    url: 'https://cdn.jsdelivr.net/gh/bladitv/cors-proxy@main/proxy.php?url=',
    encode: (url: string) => encodeURIComponent(url),
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
        const proxyUrl = `${proxyService.url}${proxyService.encode(url)}`;
        console.log(`محاولة استخدام بروكسي CORS: ${proxyUrl}`);
        
        // إضافة خيارات إضافية للتحكم في التخزين المؤقت
        const fetchOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Accept': 'application/json, text/plain, */*',
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
        const response = await fetch(proxyUrl, fetchOptions);
        
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
  
  // إذا وصلنا إلى هنا، فهذا يعني أن جميع محاولات البروكسي قد فشلت
  console.warn('فشلت جميع محاولات البروكسي CORS');
  
  // محاولة الوصول إلى CDNs المعروفة كبديل نهائي
  try {
    // بدلًا من الرابط الأصلي، نحاول مع CDNs المعروفة
    let cdnUrl = url;
    
    // تحويل روابط bladitv إلى CDN
    if (url.includes('bladitv.lovable.app') && url.includes('channels.json')) {
      // استخدام GitHub/JSDelivr كبديل
      cdnUrl = 'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json';
      console.log(`محاولة استخدام CDN بديل: ${cdnUrl}`);
      
      const fetchOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      fetchOptions.signal = controller.signal;
      
      const response = await fetch(cdnUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`نجح استخدام CDN بديل`);
        return response;
      }
    }
  } catch (cdnError) {
    console.warn('فشل استخدام CDN البديل:', cdnError);
  }
  
  // إذا وصلنا إلى هنا، فهذا يعني أن جميع المحاولات قد فشلت
  throw new Error('فشلت جميع محاولات الوصول إلى البيانات');
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

/**
 * تعديل الرابط لاستخدام مصادر بديلة إذا كان ذلك ممكنًا
 * Modify URL to use alternative sources if possible
 */
export const getAlternativeSourceUrl = (url: string): string | null => {
  // تحويل روابط Bladi TV إلى مصادر بديلة
  if (url.includes('bladitv.lovable.app') && url.includes('channels.json')) {
    return 'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json';
  }
  
  // يمكن إضافة المزيد من التحويلات المعروفة هنا
  
  return null; // لا يوجد بديل معروف
};
