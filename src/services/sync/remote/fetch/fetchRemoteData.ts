
/**
 * وظائف جلب البيانات من المصادر الخارجية
 * Functions for fetching data from remote sources
 */

import { fetchDirectly } from './fetchStrategies';
import { fetchViaProxy, isProxyRequired, getAlternativeSourceUrl } from './proxyUtils';
import { fetchViaJsonp } from './jsonpFallback';
import { enhanceFetchError } from './errorHandling';

// وظيفة جلب البيانات من المصدر الخارجي مع آليات النسخ الاحتياطي المتعددة
export const fetchRemoteData = async (url: string, options: RequestInit = {}): Promise<any> => {
  console.log(`محاولة جلب البيانات من: ${url}`);
  
  // التحقق من وجود مصادر بديلة معروفة
  const alternativeUrl = getAlternativeSourceUrl(url);
  if (alternativeUrl) {
    console.log(`استخدام مصدر بديل: ${alternativeUrl}`);
    url = alternativeUrl;
  }
  
  // آليات التحميل المختلفة التي سيتم تجربتها بالترتيب
  const fetchStrategies = [
    {
      name: 'مباشر',
      fetch: () => fetchDirectly(url, options),
      maxAttempts: 2
    },
    {
      name: 'بروكسي CORS',
      fetch: () => fetchViaProxy(url, options),
      maxAttempts: 3
    },
    {
      name: 'JSONP',
      fetch: () => fetchViaJsonp(url),
      maxAttempts: 1
    }
  ];
  
  // تحديد ما إذا كان من المحتمل أن نحتاج إلى البروكسي وإعادة ترتيب الاستراتيجيات
  try {
    const needsProxy = await isProxyRequired(url);
    if (needsProxy) {
      // ضع استراتيجية البروكسي أولاً إذا كان من المتوقع أن نحتاج إليها
      const proxyStrategy = fetchStrategies.splice(1, 1)[0];
      fetchStrategies.unshift(proxyStrategy);
    }
  } catch (error) {
    // في حالة الفشل، استمر في الترتيب الافتراضي
    console.warn('فشل في تحديد حاجة البروكسي:', error);
  }
  
  // صفيف لتتبع جميع الأخطاء التي حدثت
  const errors: Error[] = [];
  
  // تجربة كل استراتيجية واحدة تلو الأخرى حتى ينجح واحد
  for (const strategy of fetchStrategies) {
    let attemptsLeft = strategy.maxAttempts;
    
    while (attemptsLeft > 0) {
      try {
        console.log(`محاولة استخدام استراتيجية ${strategy.name} (${attemptsLeft} محاولات متبقية)`);
        
        const result = await strategy.fetch();
        console.log(`نجحت استراتيجية ${strategy.name}`);
        
        // التحقق من صحة البيانات المستلمة
        if (!result) {
          throw new Error(`استراتيجية ${strategy.name} أعادت بيانات فارغة`);
        }
        
        return result;
      } catch (error) {
        console.warn(`فشلت محاولة استراتيجية ${strategy.name}:`, error);
        errors.push(error as Error);
        attemptsLeft--;
        
        // انتظار قليلاً قبل المحاولة التالية
        if (attemptsLeft > 0) {
          console.log(`الانتظار قبل إعادة محاولة استراتيجية ${strategy.name}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.warn(`فشلت جميع محاولات استراتيجية ${strategy.name}`);
  }
  
  // إذا وصلنا إلى هنا، فشلت جميع الاستراتيجيات
  const finalError = new Error('فشلت جميع استراتيجيات الاتصال في هذه المحاولة');
  
  // تحسين رسالة الخطأ للتصحيح
  const enhancedError = enhanceFetchError(finalError, url, errors);
  
  throw enhancedError;
};

// إضافة خيار للتحقق مما إذا كان عنوان URL متاحًا دون تنزيل البيانات بالكامل
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    // التحقق من وجود مصادر بديلة معروفة
    const alternativeUrl = getAlternativeSourceUrl(url);
    if (alternativeUrl) {
      console.log(`استخدام مصدر بديل للتحقق من الإتاحة: ${alternativeUrl}`);
      url = alternativeUrl;
    }
    
    // استخدام AbortController للتحكم في المهلة
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // استخدام طلب HEAD فقط لمعرفة ما إذا كان URL متاحًا
    try {
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
      return response.ok;
    } catch (directError) {
      // إذا فشلت المحاولة المباشرة، نحاول مع وضع no-cors
      try {
        const noCorsController = new AbortController();
        const noCorsTimeoutId = setTimeout(() => noCorsController.abort(), 5000);
        
        await fetch(url, {
          method: 'HEAD',
          cache: 'no-store',
          signal: noCorsController.signal,
          mode: 'no-cors',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(noCorsTimeoutId);
        return true; // أي استجابة في وضع no-cors تعتبر نجاحًا
      } catch (noCorsError) {
        clearTimeout(timeoutId);
        console.warn(`URL غير متاح حتى مع وضع no-cors: ${url}`);
        return false;
      }
    }
  } catch (error) {
    console.warn(`URL غير متاح: ${url}`, error);
    return false;
  }
};
