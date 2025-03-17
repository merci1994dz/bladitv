
/**
 * JSONP fallback for CORS issues
 */

/**
 * Loads data using JSONP as fallback for CORS issues
 * 
 * @param url URL to load data from
 * @returns Promise resolving with the loaded data
 */
export const loadWithJsonp = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // إنشاء اسم دالة فريد لتجنب التعارضات
    const callbackName = `jsonp_callback_${Math.random().toString(36).substring(2, 15)}`;
    
    // إضافة معلمة callback إلى الرابط
    const jsonpUrl = url.includes('?') 
      ? `${url}&callback=${callbackName}` 
      : `${url}?callback=${callbackName}`;
    
    // إنشاء عنصر script لتحميل البيانات
    const script = document.createElement('script');
    script.src = jsonpUrl;
    script.async = true;
    
    // إعداد مهلة زمنية (15 ثانية)
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('تجاوز الوقت المخصص لطلب JSONP'));
    }, 15000);
    
    // دالة التنظيف
    const cleanup = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      clearTimeout(timeoutId);
    };
    
    // تعريف دالة رد النداء العالمية
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };
    
    // معالجة أخطاء التحميل
    script.onerror = () => {
      cleanup();
      reject(new Error('فشل تحميل البيانات باستخدام JSONP'));
    };
    
    // إضافة العنصر إلى المستند
    document.body.appendChild(script);
    
    console.log(`تم إنشاء طلب JSONP: ${jsonpUrl}`);
  });
};

/**
 * تحقق مما إذا كان المصدر يدعم JSONP
 */
export const isJsonpSupported = async (url: string): Promise<boolean> => {
  try {
    // محاولة اكتشاف ما إذا كان المصدر يدعم JSONP عن طريق فحص الرد على طلب استعلام
    const testUrl = url.includes('?') 
      ? `${url}&callback=test` 
      : `${url}?callback=test`;
    
    const response = await fetch(testUrl, { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    return true; // إذا لم يتم رفض الطلب، فقد يدعم JSONP
  } catch (error) {
    return false; // في حالة حدوث خطأ، افترض أن JSONP غير مدعوم
  }
};
