
/**
 * معالجة أخطاء طلبات الشبكة
 * Network request error handling
 */

import { handleError } from '@/utils/errorHandling';
import { logSyncError } from '@/services/sync/status/errorHandling';

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
  
  if (errorMsg.includes('429') || errorMsg.includes('too many requests') || errorMsg.includes('rate limit')) {
    return new Error('تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى');
  }
  
  if (errorMsg.includes('403') || errorMsg.includes('forbidden')) {
    return new Error('تم رفض الوصول إلى المصدر. تحقق من صلاحيات الوصول');
  }
  
  if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
    return new Error('غير مصرح بالوصول. قد تحتاج إلى إعادة تسجيل الدخول');
  }
  
  if (errorMsg.includes('404') || errorMsg.includes('not found')) {
    return new Error('المورد المطلوب غير موجود. تحقق من الرابط أو مصدر البيانات');
  }
  
  if (errorMsg.includes('500') || errorMsg.includes('server error')) {
    return new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا');
  }
  
  return new Error(`خطأ في جلب البيانات: ${errorMsg}`);
};

/**
 * تعزيز معالجة أخطاء الشبكة
 * Enhanced network error handling
 */
export const handleNetworkError = (error: any, context: string): Error => {
  // تسجيل معلومات الشبكة للمساعدة في التشخيص
  try {
    if (typeof navigator !== 'undefined') {
      console.log(`[${context}] حالة الاتصال:`, {
        online: navigator.onLine,
        connection: 'connection' in navigator ? (navigator as any).connection.effectiveType : 'غير معروف',
        userAgent: navigator.userAgent
      });
    }
  } catch (e) {
    // تجاهل أخطاء تسجيل معلومات الشبكة
  }
  
  // تعزيز نمط الخطأ قبل المعالجة
  if (error && typeof error === 'object' && 'code' in error) {
    // تسجيل الإضافات الخاصة بالخطأ
    console.log(`[${context}] خطأ بالرمز:`, error.code);
  }
  
  // تسجيل الخطأ في نظام معالجة الأخطاء
  const enhancedError = enhanceFetchError(error);
  
  // إضافة سياق لرسالة الخطأ
  enhancedError.message = `[${context}] ${enhancedError.message}`;
  
  // تسجيل سياق أفضل
  console.error(`[${context}] ${enhancedError.message}`, { 
    originalError: error,
    stack: error instanceof Error ? error.stack : undefined 
  });
  
  // تسجيل الخطأ في نظام السجلات
  logSyncError(enhancedError, context);
  
  // التحقق مما إذا كان المتصفح متصلاً بالإنترنت وإضافة معلومات إضافية
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
    'internet', 'إنترنت',
    '500', '502', '503', '504' // أكواد الخطأ القابلة لإعادة المحاولة
  ];
  
  // أخطاء لا ينبغي إعادة المحاولة عليها
  const neverRetryErrors = [
    'authentication', 'تسجيل الدخول',
    'permission', 'صلاحية',
    'not found', 'غير موجود',
    'validation', 'تحقق',
    '400', '401', '403', '404', '422' // أكواد الخطأ غير القابلة لإعادة المحاولة
  ];
  
  // أخطاء خاصة قد تعتمد على السياق
  const specialCaseErrors = [
    '429' // تجاوز الحد - قد نرغب في إعادة المحاولة مع تأخير أطول
  ];
  
  // التحقق من كل فئة
  const isAlwaysRetryError = alwaysRetryErrors.some(term => errorMsg.includes(term));
  const isNeverRetryError = neverRetryErrors.some(term => errorMsg.includes(term));
  const isSpecialCaseError = specialCaseErrors.some(term => errorMsg.includes(term));
  
  // معالجة الحالات الخاصة
  if (isSpecialCaseError) {
    // مع أخطاء تجاوز الحد، قد نرغب في إعادة المحاولة مع تأخير أطول
    return true; // سنعالج التأخير المناسب في مكان آخر
  }
  
  // تصنيف بناءً على رمز الخطأ إذا كان متاحاً
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = typeof error.code === 'number' ? error.code : 0;
    // أكواد مثل 408 (timeout) و 503 (service unavailable) و 504 (gateway timeout) تستحق إعادة المحاولة
    if ([408, 429, 500, 502, 503, 504].includes(errorCode)) {
      return true;
    }
    // أكواد مثل 400 (bad request) و 401 (unauthorized) و 403 (forbidden) لا تستحق إعادة المحاولة
    if ([400, 401, 403, 404, 422].includes(errorCode)) {
      return false;
    }
  }
  
  return isAlwaysRetryError && !isNeverRetryError;
};

/**
 * تحليل أخطاء الشبكة وتقديم معلومات مفيدة
 * Analyze network errors and provide useful information
 */
export const analyzeNetworkError = (error: any): {
  message: string;
  retryable: boolean;
  critical: boolean;
  code?: string | number;
  details?: Record<string, any>;
} => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const anyError = error && typeof error === 'object' ? error as any : {};
  
  // استخراج رمز الخطأ إن وجد
  let errorCode: string | number | undefined;
  if (anyError.code) {
    errorCode = anyError.code;
  } else if (anyError.status) {
    errorCode = anyError.status;
  } else {
    // محاولة استخراج رمز الخطأ من النص
    const codeMatch = errorMsg.match(/(\d{3})/);
    if (codeMatch && codeMatch[0]) {
      errorCode = codeMatch[0];
    }
  }
  
  // تحديد ما إذا كان يمكن إعادة المحاولة
  const retryable = shouldRetryFetch(error);
  
  // تحديد مدى خطورة المشكلة
  const critical = 
    errorMsg.includes('critical') ||
    errorMsg.includes('حرج') ||
    (errorCode && ['500', '503', 500, 503].includes(errorCode));
  
  // تحسين رسالة الخطأ
  const enhancedError = enhanceFetchError(error);
  
  return {
    message: enhancedError.message,
    retryable,
    critical,
    code: errorCode,
    details: {
      original: errorMsg,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      timestamp: Date.now()
    }
  };
};
