
/**
 * معالجة أخطاء طلبات الشبكة
 * Network request error handling
 */

import { handleError } from '@/utils/errorHandling';

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
  
  if (errorMsg.includes('fetch failed') || errorMsg.includes('fetch error')) {
    return new Error('فشل جلب البيانات، قد تكون المشكلة في الاتصال بالشبكة أو الخادم');
  }
  
  return new Error(`خطأ في جلب البيانات: ${errorMsg}`);
};

/**
 * تعزيز معالجة أخطاء الشبكة
 * Enhanced network error handling
 */
export const handleNetworkError = (error: any, context: string): Error => {
  // تسجيل الخطأ في نظام معالجة الأخطاء
  const enhancedError = enhanceFetchError(error);
  
  // إذا كانت الدالة معرفة استخدمها، وإلا تجاهلها
  if (typeof handleError === 'function') {
    handleError(enhancedError, context, true);
  } else {
    console.error(`[${context}]`, enhancedError);
  }
  
  // التحقق مما إذا كان المتصفح متصلاً بالإنترنت
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return new Error('أنت غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
  }
  
  return enhancedError;
};

/**
 * تحديد ما إذا كان ينبغي إعادة المحاولة بناءً على نوع الخطأ
 * Determine if retry should be attempted based on error type
 */
export const shouldRetryFetch = (error: any): boolean => {
  if (!error) return false;
  
  const errorMsg = error instanceof Error ? error.message : String(error);
  const networkRelated = 
    errorMsg.includes('network') || 
    errorMsg.includes('Network') ||
    errorMsg.includes('timeout') || 
    errorMsg.includes('تجاوز المهلة') ||
    errorMsg.includes('connection') ||
    errorMsg.includes('اتصال') ||
    errorMsg.includes('fetch') ||
    errorMsg.includes('CORS') ||
    errorMsg.includes('cors');
    
  return networkRelated;
};
