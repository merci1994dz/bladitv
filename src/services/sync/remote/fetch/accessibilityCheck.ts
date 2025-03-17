
/**
 * Check if remote URL is accessible
 */

import { getSkewProtectionParams } from './skewProtection';

/**
 * Checks if a remote URL is accessible
 * 
 * @param remoteUrl URL to check
 * @returns Promise resolving with accessibility status
 */
export const isRemoteUrlAccessible = async (remoteUrl: string): Promise<boolean> => {
  // عدم فحص المصادر المحلية
  if (remoteUrl.startsWith('/')) {
    return true;
  }
  
  // إضافة معلمات لتجنب التخزين المؤقت
  const cacheParam = `nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
  const skewParam = getSkewProtectionParams();
  const urlWithCache = remoteUrl.includes('?') 
    ? `${remoteUrl}&${cacheParam}${skewParam ? `&${skewParam}` : ''}` 
    : `${remoteUrl}?${cacheParam}${skewParam ? `&${skewParam}` : ''}`;
  
  // تعيين مهلة زمنية قصيرة (8 ثوانٍ) للتحقق من إمكانية الوصول
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    console.log(`التحقق من إمكانية الوصول إلى: ${urlWithCache}`);
    
    // تنفيذ أكثر من نهج للتحقق من إمكانية الوصول
    const methods = [
      // محاولة HEAD مع CORS
      async () => {
        try {
          console.log(`محاولة الوصول بطريقة HEAD و cors إلى ${urlWithCache}`);
          const response = await fetch(urlWithCache, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          return response.ok;
        } catch (error) {
          console.warn(`فشلت محاولة الوصول بطريقة HEAD و cors إلى ${urlWithCache}:`, error);
          return false;
        }
      },
      
      // محاولة HEAD مع no-cors
      async () => {
        try {
          console.log(`محاولة الوصول بطريقة HEAD و no-cors إلى ${urlWithCache}`);
          await fetch(urlWithCache, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors',
            cache: 'no-store',
            credentials: 'omit',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          // لا يمكن قراءة الاستجابة في وضع no-cors، لكن عدم وجود خطأ يعني أن الرابط متاح
          return true;
        } catch (error) {
          console.warn(`فشلت محاولة الوصول بطريقة HEAD و no-cors إلى ${urlWithCache}:`, error);
          return false;
        }
      },
      
      // محاولة باستخدام Image
      async () => {
        return new Promise<boolean>(resolve => {
          console.log(`محاولة فحص الوصول باستخدام Image إلى ${remoteUrl}`);
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          
          // استخدام نفس النطاق للتحقق من إمكانية الوصول
          const domain = new URL(remoteUrl).origin;
          img.src = `${domain}/favicon.ico?_=${Date.now()}`;
          
          // وضع مهلة زمنية للصورة
          setTimeout(() => resolve(false), 5000);
        });
      },
      
      // التحقق من الرابط باستخدام ping
      async () => {
        try {
          console.log(`محاولة ping للنطاق: ${new URL(remoteUrl).origin}/ping`);
          const pingUrl = `${new URL(remoteUrl).origin}/ping`;
          const response = await fetch(pingUrl, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          return response.ok;
        } catch (error) {
          console.warn(`فشل ping النطاق:`, error);
          return false;
        }
      }
    ];
    
    // تنفيذ جميع الطرق بالتوازي للحصول على أسرع نتيجة
    const results = await Promise.all(methods.map(method => method()));
    
    // إذا نجحت أي طريقة، فإن الرابط متاح
    const isAccessible = results.some(result => result === true);
    
    clearTimeout(timeoutId);
    return isAccessible;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`خطأ أثناء التحقق من إمكانية الوصول إلى ${remoteUrl}:`, error);
    return false;
  }
};
