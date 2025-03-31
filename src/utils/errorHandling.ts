
/**
 * وظائف معالجة الأخطاء
 * Error handling functions
 */

import { useToast } from '@/hooks/use-toast';

interface AppError {
  message: string;
  type: string;
  code?: string;
  retryable: boolean;
  timestamp: string;
}

/**
 * معالجة الخطأ المرسل وإنشاء كائن خطأ موحد
 * Handle thrown error and create a standardized error object
 * 
 * @param error الخطأ الذي تم إرساله
 * @param source مصدر الخطأ
 * @returns كائن خطأ موحد
 */
export const handleError = (error: any, source: string = 'unknown'): AppError => {
  // استخراج رسالة الخطأ والرمز
  // Extract error message and code
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error?.code || error?.statusCode || 'unknown';
  
  // تحديد نوع الخطأ
  // Determine error type
  let errorType = 'unknown';
  let isRetryable = false;
  
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('timeout') || 
      errorMessage.includes('fetch')) {
    errorType = 'network';
    isRetryable = true;
  } else if (errorMessage.includes('auth') || 
             errorMessage.includes('permission') || 
             errorMessage.includes('access')) {
    errorType = 'auth';
    isRetryable = false;
  } else if (errorMessage.includes('not found') || 
             errorCode.includes('404')) {
    errorType = 'not_found';
    isRetryable = false;
  } else if (errorMessage.includes('duplicate') || 
             errorCode.includes('23505')) {
    errorType = 'duplicate';
    isRetryable = false;
  } else if (errorMessage.includes('validation') || 
             errorMessage.includes('invalid')) {
    errorType = 'validation';
    isRetryable = false;
  }
  
  // بناء كائن الخطأ
  // Build error object
  const appError: AppError = {
    message: errorMessage,
    type: errorType,
    code: errorCode,
    retryable: isRetryable,
    timestamp: new Date().toISOString()
  };
  
  // تسجيل الخطأ
  // Log the error
  console.error(`[${source}] ${errorType} error:`, {
    message: errorMessage,
    code: errorCode,
    retryable: isRetryable
  });
  
  // عرض إشعار بالخطأ للمستخدم (فقط في بيئة المتصفح)
  // Show error notification to user (only in browser environment)
  if (typeof window !== 'undefined') {
    try {
      // إطلاق حدث مخصص للإشعار بالخطأ
      // Dispatch custom event for error notification
      const errorEvent = new CustomEvent('app-error', { 
        detail: appError
      });
      window.dispatchEvent(errorEvent);
    } catch (e) {
      // تجاهل الأخطاء المتعلقة بالأحداث المخصصة
      // Ignore errors related to custom events
    }
  }
  
  return appError;
};

/**
 * Hook مخصص لعرض الأخطاء باستخدام toast
 * Custom hook for displaying errors using toast
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  /**
   * عرض الخطأ باستخدام toast
   * Display error using toast
   * 
   * @param error الخطأ المراد عرضه
   * @param source مصدر الخطأ
   */
  const displayError = (error: any, source: string = 'unknown') => {
    const appError = handleError(error, source);
    
    toast({
      title: `خطأ في ${source}`,
      description: appError.message,
      variant: "destructive",
      duration: 5000,
    });
    
    return appError;
  };
  
  return { displayError, handleError };
};
