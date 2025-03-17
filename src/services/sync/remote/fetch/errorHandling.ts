
/**
 * Error handling utilities for fetch operations
 */

/**
 * Process response error for better debugging
 * 
 * @param response Fetch response object
 * @returns Promise resolving with error message
 */
export const processResponseError = async (response: Response): Promise<string> => {
  let statusText = '';
  try {
    statusText = await response.text();
  } catch (e) {
    statusText = response.statusText || 'خطأ غير معروف';
  }
  
  return `فشل في تحميل البيانات: ${response.status} ${response.statusText} - ${statusText}`;
};

/**
 * Enhance fetch error with more specific information
 * 
 * @param error Original error
 * @returns Enhanced error object
 */
export const enhanceFetchError = (error: any): Error => {
  // تحسين رسائل خطأ محددة للمساعدة في تشخيص المشكلات
  if (error.name === 'AbortError') {
    return new Error('تم إلغاء طلب البيانات بسبب تجاوز المهلة الزمنية (45 ثانية)');
  }
  
  // إضافة المزيد من معلومات الخطأ للمساعدة في التشخيص
  let errorMessage = error.message || 'خطأ غير معروف';
  
  // فحص أخطاء CORS الشائعة
  if (errorMessage.includes('CORS') || 
      errorMessage.includes('Cross-Origin') || 
      errorMessage.includes('Access-Control-Allow-Origin')) {
    return new Error('خطأ في سياسات CORS. جاري الانتقال لاستخدام وسائط المزامنة البديلة.');
  }
  
  // فحص أخطاء الشبكة الشائعة
  if (errorMessage.includes('network') || 
      errorMessage.includes('NetworkError') || 
      errorMessage.includes('net::') || 
      errorMessage.includes('internet')) {
    return new Error('خطأ في الشبكة. تحقق من اتصالك بالإنترنت وسيتم المحاولة مرة أخرى تلقائيًا.');
  }
  
  // فحص أخطاء DNS
  if (errorMessage.includes('DNS') || 
      errorMessage.includes('resolve') || 
      errorMessage.includes('lookup')) {
    return new Error('خطأ في حل اسم النطاق. قد يكون المصدر غير متاح حاليًا. سيتم استخدام مصدر بديل.');
  }
  
  // إضافة معلومات سياق للخطأ
  return new Error(`خطأ أثناء الاتصال بالمصدر: ${errorMessage}`);
};
