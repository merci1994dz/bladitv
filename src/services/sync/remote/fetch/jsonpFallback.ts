
/**
 * استخدام JSONP كآلية احتياطية عندما تفشل محاولات fetch العادية
 * Use JSONP as a fallback mechanism when regular fetch attempts fail
 */

// يتم استخدام هذا للتعامل مع مشاكل CORS التي لا يمكن حلها بطرق أخرى
// This is used to handle CORS issues that cannot be resolved by other means

// إعداد معرف عالمي فريد للمعاملات
// Set up a unique global identifier for callbacks
const JSONP_CALLBACK_PREFIX = '__jsonp_callback_';

/**
 * تنظيف موارد JSONP بأمان
 * Safely clean up JSONP resources
 */
const cleanup = (callbackName: string, script: HTMLScriptElement) => {
  try {
    // حذف الدالة العالمية التي تم إنشاؤها
    delete (window as any)[callbackName];
    
    // إزالة عنصر النص من المستند إذا كان لا يزال موجودًا
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  } catch (error) {
    console.warn('خطأ أثناء تنظيف موارد JSONP:', error);
  }
};

/**
 * تنفيذ طلب JSONP
 * Execute a JSONP request
 */
export const fetchViaJsonp = (url: string, timeout = 10000): Promise<any> => {
  return new Promise((resolve, reject) => {
    // إنشاء اسم معاودة اتصال فريد
    const callbackName = `${JSONP_CALLBACK_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // تعيين معلمة JSONP وظيفة معاودة الاتصال
    const jsonpParam = url.includes('?') ? '&' : '?';
    const jsonpUrl = `${url}${jsonpParam}callback=${callbackName}&_=${Date.now()}`;
    
    // إنشاء عنصر البرنامج النصي
    const script = document.createElement('script');
    script.src = jsonpUrl;
    script.async = true;
    script.type = 'text/javascript';
    
    // إعداد مؤقت المهلة
    const timeoutId = setTimeout(() => {
      cleanup(callbackName, script);
      reject(new Error('انتهت مهلة طلب JSONP'));
    }, timeout);
    
    // إعداد دالة معاودة الاتصال العالمية
    (window as any)[callbackName] = (data: any) => {
      clearTimeout(timeoutId);
      cleanup(callbackName, script);
      resolve(data);
    };
    
    // معالجة أخطاء تحميل البرنامج النصي
    script.onerror = () => {
      clearTimeout(timeoutId);
      cleanup(callbackName, script);
      reject(new Error('فشل تحميل JSONP'));
    };
    
    // إضافة البرنامج النصي إلى المستند
    document.head.appendChild(script);
  });
};
