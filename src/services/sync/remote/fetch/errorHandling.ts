
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
    return new Error('تم إلغاء طلب البيانات بسبب تجاوز المهلة الزمنية (30 ثانية)');
  }
  
  // فحص أخطاء CORS الشائعة
  if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
    return new Error('خطأ في سياسات CORS. محاولة استخدام الوضع المتوافق.');
  }
  
  // فحص أخطاء الشبكة الشائعة
  if (error.message.includes('network') || error.message.includes('NetworkError')) {
    return new Error('خطأ في الشبكة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
  }
  
  return error;
};
