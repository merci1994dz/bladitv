
/**
 * وظائف للتعامل مع البروكسي لتجاوز قيود CORS
 * Functions for handling proxies to bypass CORS restrictions
 */

// قائمة بروكسيات CORS التي يمكن استخدامها
// List of CORS proxies that can be used
const CORS_PROXIES = [
  {
    name: 'allorigins.win',
    getUrl: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    reliability: 3,
  },
  {
    name: 'cors.sh',
    getUrl: (url: string) => `https://proxy.cors.sh/${url}`,
    reliability: 2,
  },
  {
    name: 'thingproxy',
    getUrl: (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
    reliability: 2,
  },
  {
    name: 'cors-proxy',
    getUrl: (url: string) => `https://cdn.jsdelivr.net/gh/bladitv/cors-proxy@main/proxy.php?url=${encodeURIComponent(url)}`,
    reliability: 1,
  },
  {
    name: 'crossorigin.me',
    getUrl: (url: string) => `https://crossorigin.me/${url}`,
    reliability: 1,
  },
  {
    name: 'corsproxy.io',
    getUrl: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    reliability: 2,
  },
];

// مصادر بديلة معروفة للتغلب على الحجب
// Known alternative sources to overcome blocking
const ALTERNATIVE_SOURCES: Record<string, string> = {
  'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json': 'https://fastly.jsdelivr.net/gh/bladitv/channels@master/channels.json',
  'https://raw.githubusercontent.com/bladitv/channels/master/channels.json': 'https://bladitv.github.io/channels/channels.json',
};

/**
 * الحصول على مصدر بديل لعنوان URL إذا كان معروفًا
 * Get alternative source for URL if known
 */
export const getAlternativeSourceUrl = (url: string): string | null => {
  return ALTERNATIVE_SOURCES[url] || null;
};

/**
 * تمرير طلب عبر بروكسي CORS
 * Pass request through CORS proxy
 */
export const fetchViaProxy = async (url: string, options: RequestInit = {}): Promise<any> => {
  // ترتيب البروكسيات حسب الموثوقية
  // Sort proxies by reliability
  const sortedProxies = [...CORS_PROXIES].sort((a, b) => b.reliability - a.reliability);
  
  // تجربة كل بروكسي بالترتيب
  // Try each proxy in order
  for (const proxy of sortedProxies) {
    const proxyUrl = proxy.getUrl(url);
    try {
      console.log(`محاولة استخدام بروكسي CORS: ${proxyUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(proxyUrl, {
        ...options,
        cache: 'no-store',
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`استجابة غير ناجحة: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`فشل استخدام بروكسي ${proxy.name}:`, error);
    }
  }
  
  throw new Error('فشلت جميع محاولات البروكسي');
};

/**
 * التحقق إذا كان البروكسي مطلوبًا لهذا العنوان
 * Check if proxy is required for this URL
 */
export const isProxyRequired = async (url: string): Promise<boolean> => {
  try {
    // محاولة طلب بسيط للتحقق من قيود CORS
    // Try a simple request to check for CORS restrictions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return false; // لا توجد قيود CORS
  } catch (error) {
    console.log('CORS يبدو مطلوبًا:', error);
    return true; // على الأرجح هناك قيود CORS
  }
};
