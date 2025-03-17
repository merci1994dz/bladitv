
/**
 * معالجة أخطاء طلبات الشبكة
 * Network request error handling
 */

/**
 * معالجة أخطاء الاستجابة
 * Process response errors
 */
export const processResponseError = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return errorData.message || errorData.error || `خطأ في الاستجابة: ${response.status} ${response.statusText}`;
    } else {
      const text = await response.text();
      return text || `خطأ في الاستجابة: ${response.status} ${response.statusText}`;
    }
  } catch (e) {
    return `خطأ في الاستجابة: ${response.status} ${response.statusText}`;
  }
};

/**
 * تحسين رسائل الخطأ
 * Enhance error messages
 */
export const enhanceFetchError = (error: any): Error => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  
  if (errorMsg.includes('aborted') || errorMsg.includes('abort')) {
    return new Error('تم إلغاء الطلب بسبب تجاوز المهلة الزمنية');
  }
  
  if (errorMsg.includes('network') || errorMsg.includes('Network')) {
    return new Error('خطأ في الشبكة، تأكد من اتصالك بالإنترنت');
  }
  
  if (errorMsg.includes('SSL') || errorMsg.includes('certificate')) {
    return new Error('خطأ في شهادة SSL، تأكد من أمان الموقع');
  }
  
  if (errorMsg.includes('CORS') || errorMsg.includes('origin')) {
    return new Error('خطأ CORS: المصدر الخارجي لا يسمح بالوصول من هذا الموقع');
  }
  
  return new Error(`خطأ في جلب البيانات: ${errorMsg}`);
};
