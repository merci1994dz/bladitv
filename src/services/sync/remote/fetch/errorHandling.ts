
/**
 * معالجة أخطاء طلبات الشبكة
 * Network request error handling
 */

import { logSyncError } from '../../status/errorHandling';

/**
 * معالجة خطأ الاستجابة
 * Process response error
 */
export const processResponseError = async (response: Response): Promise<string> => {
  try {
    // محاولة قراءة رسالة الخطأ من الاستجابة
    // Try to read error message from response
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        const errorJson = await response.json();
        if (errorJson.error || errorJson.message) {
          return errorJson.error || errorJson.message;
        }
      } catch (jsonError) {
        // تجاهل أخطاء تحليل JSON
        // Ignore JSON parsing errors
      }
    }
    
    // رسائل الخطأ بناءً على رمز الحالة
    // Error messages based on status code
    switch (response.status) {
      case 400:
        return 'طلب غير صالح';
      case 401:
        return 'غير مصرح بالوصول';
      case 403:
        return 'محظور الوصول';
      case 404:
        return 'لم يتم العثور على المصدر';
      case 429:
        return 'طلبات كثيرة جدًا، حاول مرة أخرى لاحقًا';
      case 500:
        return 'خطأ في الخادم الداخلي';
      case 503:
        return 'الخدمة غير متاحة، حاول مرة أخرى لاحقًا';
      default:
        return `خطأ في الطلب: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    console.error('خطأ في معالجة خطأ الاستجابة:', error);
    return 'حدث خطأ أثناء معالجة استجابة الخادم';
  }
};

/**
 * إدارة خطأ الشبكة العام
 * Handle general network error
 */
export const handleNetworkError = (error: Error | unknown, url: string, context?: string): Error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // تسجيل الخطأ في السجل
  // Log error
  console.error(`خطأ في طلب الشبكة (${url}):`, errorMessage);
  
  // تسجيل خطأ المزامنة
  // Log sync error
  logSyncError(errorMessage, context || 'network_request');
  
  return new Error(`فشل طلب الشبكة: ${errorMessage}`);
};

/**
 * فحص ما إذا كان الخطأ مرتبطًا بقيود CORS
 * Check if error is related to CORS restrictions
 */
export const isCorsError = (error: Error | unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return errorMessage.includes('CORS') || 
         errorMessage.includes('cross-origin') ||
         errorMessage.includes('Cross-Origin') ||
         errorMessage.includes('has been blocked by CORS policy');
};

/**
 * فحص ما إذا كان الخطأ مرتبطًا بفشل الشبكة
 * Check if error is related to network failure
 */
export const isNetworkError = (error: Error | unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return errorMessage.includes('network') ||
         errorMessage.includes('Network') ||
         errorMessage.includes('connection') ||
         errorMessage.includes('timeout') ||
         errorMessage.includes('timed out') ||
         errorMessage.includes('unreachable');
};
