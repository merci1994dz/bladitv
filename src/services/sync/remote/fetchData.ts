
/**
 * Utility functions for fetching data from remote sources with error handling and cache prevention
 */

import { validateRemoteData } from '../remoteValidation';

/**
 * Fetches data from a remote URL with cache-busting parameters and timeout protection
 */
export const fetchRemoteData = async (remoteUrl: string): Promise<any> => {
  // إضافة معلمات لتجنب التخزين المؤقت
  const cacheParam = `nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
  const urlWithCache = remoteUrl.includes('?') 
    ? `${remoteUrl}&${cacheParam}` 
    : `${remoteUrl}?${cacheParam}`;
  
  // إضافة حماية التزامن Vercel Skew Protection
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  // إضافة رأس معرف النشر إذا كانت حماية التزامن مُفعلة
  if (typeof window !== 'undefined' && window.ENV && window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1') {
    if (window.ENV.VERCEL_DEPLOYMENT_ID) {
      headers['x-deployment-id'] = window.ENV.VERCEL_DEPLOYMENT_ID;
      console.log('تم تفعيل حماية التزامن Vercel Skew Protection');
    }
  }
  
  // إضافة مهلة زمنية للطلب - 10 ثوانٍ
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
    
    // محاولة الاتصال عدة مرات في حالة الفشل
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const response = await fetch(urlWithCache, {
          method: 'GET',
          headers,
          cache: 'no-store',
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`فشل في تحميل البيانات: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // التحقق من صحة البيانات
        if (!validateRemoteData(data)) {
          throw new Error('البيانات المستلمة غير صالحة');
        }
        
        clearTimeout(timeoutId);
        return data;
      } catch (error) {
        console.warn(`فشلت المحاولة ${4 - retries}/3 للاتصال بـ ${remoteUrl}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // الانتظار قبل المحاولة مرة أخرى (زيادة وقت الانتظار مع كل محاولة)
          await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
        }
      }
    }
    
    // إذا فشلت جميع المحاولات
    clearTimeout(timeoutId);
    throw lastError || new Error('فشلت جميع محاولات الاتصال بالمصدر الخارجي');
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('تم إلغاء طلب البيانات بسبب تجاوز المهلة الزمنية');
    }
    
    throw error;
  }
};

/**
 * استرجاع معلمات حماية التزامن من Vercel
 */
export const getSkewProtectionParams = (): string => {
  if (typeof window !== 'undefined' && window.ENV && 
      window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1' && 
      window.ENV.VERCEL_DEPLOYMENT_ID) {
    return `dpl=${window.ENV.VERCEL_DEPLOYMENT_ID}`;
  }
  return '';
};

/**
 * فحص إذا كان بإمكاننا الوصول إلى رابط خارجي عن طريق طلب HEAD
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`تعذر الوصول إلى ${url}:`, error);
    return false;
  }
};
