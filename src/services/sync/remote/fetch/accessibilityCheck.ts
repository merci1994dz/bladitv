
/**
 * Utilities for checking remote URL accessibility
 */

import { detectBrowser } from './browserDetection';

/**
 * Check if a remote URL is accessible
 * 
 * @param url URL to check
 * @returns Promise resolving with boolean indicating accessibility
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // زيادة المهلة إلى 10 ثواني
    
    // كشف المتصفح للتوافق الأفضل
    const { isSafari, isIE, isEdge } = detectBrowser();
    
    // محاولات متعددة بخيارات مختلفة
    const fetchMethods = ['HEAD', 'GET'];
    const fetchModes = ['cors', 'no-cors'];
    
    for (const method of fetchMethods) {
      for (const mode of fetchModes) {
        try {
          // إضافة معلمات لمنع التخزين المؤقت
          const cacheParam = `nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
          const urlWithCache = url.includes('?') 
            ? `${url}&${cacheParam}` 
            : `${url}?${cacheParam}`;
          
          const fetchOptions: RequestInit = {
            method,
            signal: controller.signal,
            mode: mode as RequestMode,
            credentials: 'omit',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          };
          
          // تعديلات لبعض المتصفحات
          if (isSafari || isIE || isEdge) {
            delete fetchOptions.cache;
          }
          
          const response = await fetch(urlWithCache, fetchOptions);
          
          clearTimeout(timeoutId);
          
          // لـ no-cors، لا يمكننا الوصول إلى حالة الاستجابة، لذا نفترض أنها ناجحة إذا لم يتم رفض الوعد
          if (mode === 'no-cors') {
            return true;
          }
          
          return response.ok || response.status === 0;
        } catch (attemptError) {
          console.warn(`فشلت محاولة الوصول بطريقة ${method} و ${mode} إلى ${url}:`, attemptError);
          // نستمر في المحاولة التالية
        }
      }
    }
    
    // محاولة أخيرة باستخدام طريقة مبسطة
    try {
      const img = new Image();
      const imgPromise = new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
      
      // استخدام صورة صغيرة من الموقع نفسه للتحقق
      const domain = new URL(url).origin;
      img.src = `${domain}/favicon.ico?_=${Date.now()}`;
      
      return await imgPromise;
    } catch (imgError) {
      // تجاهل الخطأ، نعود false
    }
    
    return false;
  } catch (error) {
    console.warn(`تعذر الوصول إلى ${url}:`, error);
    return false;
  }
};
