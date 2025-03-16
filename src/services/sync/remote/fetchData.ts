
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
    'Expires': '0'
  };
  
  // إضافة رأس معرف النشر إذا كانت حماية التزامن مُفعلة
  if (typeof window !== 'undefined' && window.ENV && window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1') {
    if (window.ENV.VERCEL_DEPLOYMENT_ID) {
      headers['x-deployment-id'] = window.ENV.VERCEL_DEPLOYMENT_ID;
      console.log('تم تفعيل حماية التزامن Vercel Skew Protection');
    }
  }
  
  // إضافة مهلة زمنية للطلب - 8 ثوانٍ
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
    const response = await fetch(urlWithCache, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`فشل في تحميل البيانات: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // التحقق من صحة البيانات
    if (!validateRemoteData(data)) {
      throw new Error('البيانات المستلمة غير صالحة');
    }
    
    return data;
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
