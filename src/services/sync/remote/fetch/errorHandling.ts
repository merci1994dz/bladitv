
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
  
  // تصنيف أفضل للأخطاء الشائعة
  if (errorMsg.includes('aborted') || errorMsg.includes('abort')) {
    return new Error('تم إلغاء الطلب بسبب تجاوز المهلة الزمنية');
  }
  
  if (errorMsg.includes('استراتيجيات الاتصال') || errorMsg.includes('فشلت جميع')) {
    return new Error('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك وتغيير مصدر البيانات في الإعدادات');
  }
  
  if (errorMsg.includes('network') || errorMsg.includes('Network')) {
    return new Error('خطأ في الشبكة، تأكد من اتصالك بالإنترنت');
  }
  
  if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch failed')) {
    return new Error('فشل في الاتصال بالخادم. تحقق من إعدادات الشبكة أو المتصفح');
  }
  
  if (errorMsg.includes('SSL') || errorMsg.includes('certificate')) {
    return new Error('خطأ في شهادة SSL، تأكد من أمان الموقع');
  }
  
  if (errorMsg.includes('CORS') || errorMsg.includes('origin')) {
    return new Error('خطأ CORS: يتم منع الوصول للمصدر الخارجي. جرب تغيير المصدر');
  }
  
  if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
    return new Error('انتهت مهلة الاتصال. تحقق من سرعة الاتصال وحاول مرة أخرى');
  }
  
  return new Error(`خطأ في جلب البيانات: ${errorMsg}`);
};

/**
 * تعزيز معالجة أخطاء الشبكة
 * Enhanced network error handling
 */
export const handleNetworkError = (error: any, context: string): Error => {
  // تعزيز نمط الخطأ قبل المعالجة
  if (error && typeof error === 'object' && 'code' in error) {
    // تسجيل الإضافات الخاصة بالخطأ
    console.log(`[${context}] خطأ بالرمز:`, error.code);
  }
  
  // تسجيل الخطأ في نظام معالجة الأخطاء
  const enhancedError = enhanceFetchError(error);
  
  // تسجيل سياق أفضل
  console.error(`[${context}] ${enhancedError.message}`, { 
    originalError: error,
    stack: error instanceof Error ? error.stack : undefined 
  });
  
  // إذا كانت الدالة معرفة استخدمها
  if (typeof handleError === 'function') {
    handleError(enhancedError, context, true);
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
  
  // تحسين تصنيف أخطاء الشبكة القابلة لإعادة المحاولة
  const errorMsg = error instanceof Error ? error.message : String(error);
  
  // أخطاء دائماً قابلة لإعادة المحاولة
  const alwaysRetryErrors = [
    'network', 'Network',
    'timeout', 'timed out', 'تجاوز المهلة',
    'connection', 'اتصال',
    'fetch failed', 'Failed to fetch',
    'CORS', 'cors',
    'internet', 'إنترنت'
  ];
  
  // أخطاء لا ينبغي إعادة المحاولة عليها
  const neverRetryErrors = [
    'authentication', 'تسجيل الدخول',
    'permission', 'صلاحية',
    'not found', 'غير موجود',
    'validation', 'تحقق'
  ];
  
  // التحقق من كل فئة
  const isAlwaysRetryError = alwaysRetryErrors.some(term => errorMsg.includes(term));
  const isNeverRetryError = neverRetryErrors.some(term => errorMsg.includes(term));
  
  // تصنيف بناءً على رمز الخطأ إذا كان متاحاً
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = typeof error.code === 'number' ? error.code : 0;
    // أكواد مثل 408 (timeout) و 503 (service unavailable) و 504 (gateway timeout) تستحق إعادة المحاولة
    if ([408, 429, 500, 502, 503, 504].includes(errorCode)) {
      return true;
    }
  }
  
  return isAlwaysRetryError && !isNeverRetryError;
};
