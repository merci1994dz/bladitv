
/**
 * أدوات استخدام البروكسي للتغلب على قيود CORS
 * Proxy utilities to overcome CORS limitations
 */

/**
 * الحصول على قائمة روابط البروكسي
 * Get list of proxy URLs
 */
export const getProxyUrls = (url: string): string[] => [
  // استخدام بروكسي أكثر موثوقية أولاً
  `https://corsproxy.io/?${encodeURIComponent(url)}`,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  // بروكسي احتياطية إضافية
  `https://cors-anywhere-hosting-27ad7.web.app/${url}`,
  `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
  `https://api.scraperbox.com/proxy?url=${encodeURIComponent(url)}`,
  // نحتفظ بهذه كخيار أخير لأنه قد يتطلب تسجيل الدخول/تصريح
  `https://cors-anywhere.herokuapp.com/${url}`
];

/**
 * محاولة جلب البيانات عبر بروكسي CORS
 * Try to fetch data via CORS proxy
 */
export const fetchViaProxy = async (url: string, signal: AbortSignal): Promise<any> => {
  const proxyUrls = getProxyUrls(url);
  
  // للتتبع والتشخيص
  console.log(`بدء محاولات البروكسي لـ ${url}. سيتم تجربة ${proxyUrls.length} بروكسي.`);
  
  // إنشاء قائمة بالأخطاء لأغراض التشخيص
  const proxyErrors: Record<string, string> = {};
  
  // محاولة كل بروكسي بالترتيب مع استراتيجية محسنة
  for (const proxyUrl of proxyUrls) {
    try {
      console.log(`محاولة استخدام بروكسي CORS: ${proxyUrl}`);
      
      // إنشاء نسخة جديدة من إشارة الإلغاء مع مهلة مخصصة لكل بروكسي
      const proxyController = new AbortController();
      const timeoutId = setTimeout(() => proxyController.abort(), 7000); // مهلة أقصر لكل بروكسي
      
      // دمج إشارة الإلغاء الأصلية مع إشارة المهلة
      const combinedSignal = signal.aborted ? signal : proxyController.signal;
      
      // إضافة رؤوس HTTP تمنع التخزين المؤقت وتزيد من فرص النجاح
      const proxyResponse = await fetch(proxyUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: combinedSignal,
        credentials: 'omit', // تجنب إرسال الاعتمادات للمواقع الخارجية
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Proxy-Request': 'true',
          'X-Requested-At': new Date().toISOString(),
          'X-Client-Version': '1.0.0'
        }
      });
      
      // تنظيف المهلة
      clearTimeout(timeoutId);
      
      // التحقق من صحة الاستجابة
      if (proxyResponse.ok) {
        console.log(`نجاح البروكسي: ${proxyUrl}`);
        
        try {
          const text = await proxyResponse.text();
          // محاولة تحليل النص كـ JSON
          try {
            return JSON.parse(text);
          } catch (jsonError) {
            // إذا لم يكن JSON صالحًا، تحقق مما إذا كان النص يحتوي على JSON مضمّن
            if (text.includes('{') && text.includes('}')) {
              const jsonMatch = text.match(/\{.*\}/s);
              if (jsonMatch) {
                try {
                  return JSON.parse(jsonMatch[0]);
                } catch (embeddedJsonError) {
                  console.warn('فشل تحليل JSON المضمّن:', embeddedJsonError);
                }
              }
            }
            console.warn('تم استلام استجابة من البروكسي لكن فشل تحليل JSON:', jsonError);
            // إعادة النص الخام كمصفوفة للتعامل معه لاحقًا
            return { rawText: text };
          }
        } catch (textError) {
          console.warn('فشل استخراج النص من استجابة البروكسي:', textError);
          proxyErrors[proxyUrl] = `فشل استخراج النص: ${textError.message}`;
        }
      } else {
        // تسجيل رمز الحالة للمساعدة في التشخيص
        console.warn(`فشل البروكسي ${proxyUrl} برمز الحالة: ${proxyResponse.status}`);
        proxyErrors[proxyUrl] = `رمز الحالة: ${proxyResponse.status}`;
      }
    } catch (proxyError) {
      const errorMessage = proxyError instanceof Error ? proxyError.message : String(proxyError);
      console.warn(`فشل استخدام بروكسي CORS (${proxyUrl}): ${errorMessage}`);
      proxyErrors[proxyUrl] = errorMessage;
      
      // إضافة تأخير بسيط بين المحاولات لمنع الحظر
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // إذا فشلت جميع محاولات البروكسي، قم بإنشاء تقرير خطأ مفصل
  console.error('فشلت جميع محاولات البروكسي للـ URL:', url);
  console.error('تفاصيل أخطاء البروكسي:', proxyErrors);
  
  throw new Error(`فشلت جميع محاولات البروكسي (${Object.keys(proxyErrors).length})`);
};

/**
 * اختبار ما إذا كان بروكسي CORS معين متاحًا ويعمل حاليًا
 * Test if a specific CORS proxy is available and currently working
 */
export const testProxyAvailability = async (proxyUrl: string, testUrl: string): Promise<boolean> => {
  try {
    const testEndpoint = testUrl || 'https://httpbin.org/get';
    const fullProxyUrl = proxyUrl.includes('?url=') 
      ? `${proxyUrl}${encodeURIComponent(testEndpoint)}`
      : `${proxyUrl}${testEndpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(fullProxyUrl, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * الحصول على بروكسي يعمل حاليًا من القائمة
 * Get a currently working proxy from the list
 */
export const getWorkingProxy = async (url: string): Promise<string | null> => {
  const proxyUrls = getProxyUrls(url);
  
  for (const proxyUrl of proxyUrls) {
    if (await testProxyAvailability(proxyUrl, url)) {
      return proxyUrl;
    }
    // تأخير بسيط بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return null;
};
