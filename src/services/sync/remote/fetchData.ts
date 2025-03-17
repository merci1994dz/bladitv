
/**
 * Utility functions for fetching data from remote sources with improved error handling and cache prevention
 */

import { validateRemoteData } from '../remoteValidation';

/**
 * Fetches data from a remote URL with cache-busting parameters and timeout protection
 */
export const fetchRemoteData = async (remoteUrl: string): Promise<any> => {
  // التعامل مع المصادر المحلية
  if (remoteUrl.startsWith('/')) {
    try {
      console.log(`تحميل البيانات من ملف محلي: ${remoteUrl}`);
      const response = await fetch(remoteUrl, {
        method: 'GET',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`فشل في تحميل الملف المحلي: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`خطأ في تحميل الملف المحلي ${remoteUrl}:`, error);
      throw error;
    }
  }
  
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
    'Origin': window.location.origin
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
        // كشف المتصفح لمعالجة متطلبات مختلفة
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
        const isEdge = !isIE && !!(window as any).StyleMedia;
        
        // تعديل خيارات الطلب بناءً على المتصفح
        const fetchOptions: RequestInit = {
          method: 'GET',
          headers,
          cache: 'no-store',
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        };
        
        // تكييف خيارات الطلب للمتصفحات المختلفة
        if (isSafari || isIE || isEdge) {
          // في بعض المتصفحات، قد نحتاج لتبسيط الخيارات
          delete fetchOptions.cache;
          
          // نضيف إضافة no-cors mode للمحاولات الأخيرة
          if (retries <= 2) {
            fetchOptions.mode = 'no-cors';
            console.log('استخدام وضع no-cors للمتصفحات المتوافقة');
          }
        }
        
        // إضافة محاولة بطرق مختلفة حسب عدد المحاولات المتبقية
        if (retries <= 3) {
          // في المحاولات الأخيرة، استخدم JSONP للتغلب على قيود CORS
          try {
            const jsonpUrl = `${urlWithCache}&callback=bladiInfoCallback`;
            const jsonpPromise = new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = jsonpUrl;
              
              // تعريف الدالة التي سيتم استدعاؤها
              (window as any).bladiInfoCallback = (data: any) => {
                resolve(data);
                document.head.removeChild(script);
                delete (window as any).bladiInfoCallback;
              };
              
              // التعامل مع الخطأ
              script.onerror = () => {
                reject(new Error('فشل JSONP'));
                document.head.removeChild(script);
                delete (window as any).bladiInfoCallback;
              };
              
              document.head.appendChild(script);
              
              // وضع حد زمني للطلب
              setTimeout(() => {
                if ((window as any).bladiInfoCallback) {
                  reject(new Error('انتهت مهلة JSONP'));
                  document.head.removeChild(script);
                  delete (window as any).bladiInfoCallback;
                }
              }, 10000);
            });
            
            // محاولة JSONP
            try {
              const jsonpData = await jsonpPromise;
              clearTimeout(timeoutId);
              return jsonpData;
            } catch (jsonpError) {
              console.warn('فشلت محاولة JSONP، سنواصل المحاولة بالطرق التقليدية');
            }
          } catch (jsonpSetupError) {
            console.warn('فشل إعداد JSONP', jsonpSetupError);
          }
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
      throw new Error('خطأ في سياسات CORS. محاولة استخدام الوضع المتوافق.');
    }
    
    // فحص أخطاء الشبكة الشائعة
    if (error.message.includes('network') || error.message.includes('NetworkError')) {
      throw new Error('خطأ في الشبكة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
    }
    
    throw error;
  }
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
