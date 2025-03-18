
/**
 * استراتيجيات مختلفة لجلب البيانات من المصادر الخارجية
 * Different strategies for fetching data from remote sources
 */

/**
 * محاولة استراتيجية البروكسي
 * Try proxy strategy
 */
export const tryProxyStrategy = async (url: string, options: RequestInit = {}): Promise<any> => {
  // دالة جلب البيانات عبر البروكسي تم نقلها إلى ملف proxyUtils.ts
  const { fetchViaProxy } = await import('./proxyUtils');
  
  try {
    const response = await fetchViaProxy(url, options);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * جلب البيانات مباشرة (بدون بروكسي)
 * Fetch data directly (without proxy)
 */
export const fetchDirectly = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    console.log(`محاولة الجلب المباشر من: ${url}`);
    
    // إضافة المزيد من خيارات التحكم في التخزين المؤقت
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
    
    // استخدام AbortController للتحكم في المهلة
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    fetchOptions.signal = controller.signal;
    
    // محاولة الجلب المباشر
    const response = await fetch(url, fetchOptions);
    
    // إلغاء المؤقت لتجنب التسريب
    clearTimeout(timeoutId);
    
    // التحقق من نجاح الاستجابة
    if (!response.ok) {
      throw new Error(`فشل الطلب المباشر: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('فشل الجلب المباشر:', error);
    throw error;
  }
};

/**
 * استخدام آلية استعلام مرنة تناسب أنواع مختلفة من الخوادم
 * Use a flexible querying mechanism suitable for different server types
 */
export const fetchWithFlexibleFormat = async (url: string): Promise<any> => {
  // تجربة عدة تنسيقات URL للتوافق مع أنواع مختلفة من الخوادم
  
  try {
    // أولاً، حاول الوصول إلى URL كما هو
    const originalResult = await fetchDirectly(url);
    return originalResult;
  } catch (originalError) {
    try {
      // جرب إضافة .json إذا لم يكن موجودًا بالفعل
      if (!url.endsWith('.json')) {
        const jsonUrl = `${url}.json`;
        console.log(`محاولة استخدام تنسيق JSON: ${jsonUrl}`);
        return await fetchDirectly(jsonUrl);
      }
      throw originalError;
    } catch (jsonError) {
      try {
        // جرب إضافة ?format=json
        const queryUrl = `${url}${url.includes('?') ? '&' : '?'}format=json`;
        console.log(`محاولة استخدام معلمة format=json: ${queryUrl}`);
        return await fetchDirectly(queryUrl);
      } catch (queryError) {
        // إذا فشلت جميع المحاولات، ارفع الخطأ الأصلي
        throw originalError;
      }
    }
  }
};
