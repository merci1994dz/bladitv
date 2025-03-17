
/**
 * Utility functions for fetching data from remote sources with improved error handling and cache prevention
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
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin,
    'Referer': window.location.origin
  };
  
  // إضافة رأس معرف النشر إذا كانت حماية التزامن مُفعلة
  if (typeof window !== 'undefined' && window.ENV && window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1') {
    if (window.ENV.VERCEL_DEPLOYMENT_ID) {
      headers['x-deployment-id'] = window.ENV.VERCEL_DEPLOYMENT_ID;
      console.log('تم تفعيل حماية التزامن Vercel Skew Protection');
    }
  }
  
  // إضافة مهلة زمنية للطلب - زيادة إلى 30 ثانية
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
    
    // تحسين معالجة الأخطاء مع دعم متعدد المتصفحات
    let retries = 5; // زيادة عدد المحاولات
    let lastError;
    
    while (retries > 0) {
      try {
        // إضافة كشف المتصفح لمعالجة متطلبات مختلفة
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
        const isEdge = !isIE && !!(window as any).StyleMedia;
        
        // تعديل خيارات الطلب بناءً على المتصفح للتوافق الأفضل
        const fetchOptions: RequestInit = {
          method: 'GET',
          headers,
          cache: 'no-store',
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        };
        
        // تعديلات لمتصفحات محددة
        if (isSafari || isIE || isEdge) {
          // في بعض المتصفحات، قد نحتاج لتبسيط الخيارات
          delete fetchOptions.cache;
          
          // إضافة رؤوس خاصة بالمتصفح
          headers['X-Browser-Compatibility'] = 'true';
          
          console.log('استخدام إعدادات متوافقة لمتصفح Safari/IE/Edge');
        }
        
        const response = await fetch(urlWithCache, fetchOptions);
        
        if (!response.ok) {
          // تحسين معلومات الخطأ مع شيفرة الحالة ونص الرد
          let statusText = '';
          try {
            statusText = await response.text();
          } catch (e) {
            statusText = response.statusText || 'خطأ غير معروف';
          }
          
          throw new Error(`فشل في تحميل البيانات: ${response.status} ${response.statusText} - ${statusText}`);
        }
        
        // تحليل البيانات مع معالجة أفضل لأخطاء JSON
        let data;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error('خطأ في تحليل JSON:', jsonError);
          throw new Error('تم استلام رد غير صالح من الخادم (بيانات JSON غير صالحة)');
        }
        
        // التحقق من صحة البيانات
        if (!validateRemoteData(data)) {
          throw new Error('البيانات المستلمة غير صالحة أو لا تتطابق مع الهيكل المتوقع');
        }
        
        clearTimeout(timeoutId);
        return data;
      } catch (error) {
        console.warn(`فشلت المحاولة ${6 - retries}/5 للاتصال بـ ${remoteUrl}:`, error);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // الانتظار قبل المحاولة مرة أخرى مع زيادة وقت الانتظار 
          const backoffTime = (6 - retries) * 1500 + Math.random() * 1000;
          console.log(`الانتظار ${backoffTime}ms قبل المحاولة التالية...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
    
    // إذا فشلت جميع المحاولات
    clearTimeout(timeoutId);
    throw lastError || new Error('فشلت جميع محاولات الاتصال بالمصدر الخارجي');
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    // تحسين رسائل خطأ محددة للمساعدة في تشخيص المشكلات
    if (error.name === 'AbortError') {
      throw new Error('تم إلغاء طلب البيانات بسبب تجاوز المهلة الزمنية (30 ثانية)');
    }
    
    // فحص أخطاء CORS الشائعة
    if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
      throw new Error('خطأ في سياسات CORS. تحقق من تكوين الخادم للسماح بطلبات من هذا الموقع.');
    }
    
    // فحص أخطاء الشبكة الشائعة
    if (error.message.includes('network') || error.message.includes('NetworkError')) {
      throw new Error('خطأ في الشبكة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
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
 * فحص إذا كان بإمكاننا الوصول إلى رابط خارجي عن طريق طلب HEAD مع تحسينات للتوافق مع المتصفحات
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // زيادة المهلة إلى 10 ثواني
    
    // كشف المتصفح للتوافق الأفضل
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
    const isEdge = !isIE && !!(window as any).StyleMedia;
    
    // تعديل الخيارات للتوافق الأفضل مع المتصفح
    const fetchOptions: RequestInit = {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
    
    if (isSafari || isIE || isEdge) {
      // تبسيط الخيارات للمتصفحات القديمة
      delete fetchOptions.cache;
      // استخدام GET بدلاً من HEAD في بعض الحالات لتحسين التوافق
      if (isIE) {
        fetchOptions.method = 'GET';
      }
    }
    
    // إضافة معلمات لمنع التخزين المؤقت
    const cacheParam = `nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
    const urlWithCache = url.includes('?') 
      ? `${url}&${cacheParam}` 
      : `${url}?${cacheParam}`;
    
    // محاولة الاتصال مع إعادة المحاولة مرة واحدة في حالة الفشل
    try {
      const response = await fetch(urlWithCache, fetchOptions);
      clearTimeout(timeoutId);
      return response.ok;
    } catch (firstError) {
      console.warn(`المحاولة الأولى للوصول إلى ${url} فشلت:`, firstError);
      
      // تعديل الطريقة إلى GET في المحاولة الثانية
      fetchOptions.method = 'GET';
      
      try {
        const response = await fetch(urlWithCache, fetchOptions);
        clearTimeout(timeoutId);
        return response.ok;
      } catch (secondError) {
        clearTimeout(timeoutId);
        return false;
      }
    }
  } catch (error) {
    console.warn(`تعذر الوصول إلى ${url}:`, error);
    return false;
  }
};
