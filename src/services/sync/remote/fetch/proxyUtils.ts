
/**
 * أدوات استخدام البروكسي للتغلب على قيود CORS
 * Proxy utilities to overcome CORS limitations
 */

/**
 * الحصول على قائمة روابط البروكسي
 * Get list of proxy URLs
 */
export const getProxyUrls = (url: string): string[] => [
  `https://corsproxy.io/?${encodeURIComponent(url)}`,
  `https://cors-anywhere.herokuapp.com/${url}`,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  `https://proxy.cors.sh/${url}`
];

/**
 * محاولة جلب البيانات عبر بروكسي CORS
 * Try to fetch data via CORS proxy
 */
export const fetchViaProxy = async (url: string, signal: AbortSignal): Promise<any> => {
  const proxyUrls = getProxyUrls(url);
  
  // محاولة كل بروكسي بالترتيب
  for (const proxyUrl of proxyUrls) {
    console.log(`محاولة استخدام بروكسي CORS: ${proxyUrl}`);
    try {
      const proxyResponse = await fetch(proxyUrl, {
        method: 'GET',
        cache: 'no-store',
        signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (proxyResponse.ok) {
        const text = await proxyResponse.text();
        try {
          return JSON.parse(text);
        } catch (jsonError) {
          console.warn('تم استلام استجابة من البروكسي لكن فشل تحليل JSON:', jsonError);
        }
      }
    } catch (proxyError) {
      console.warn(`فشل استخدام بروكسي CORS: ${proxyError.message}`);
    }
  }
  
  // إذا فشلت جميع محاولات البروكسي
  throw new Error('فشلت جميع محاولات البروكسي');
};
