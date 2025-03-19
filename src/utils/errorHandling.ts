
/**
 * مرافق متقدمة لمعالجة الأخطاء وإعادة المحاولة
 */

import { toast } from '@/hooks/use-toast';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

// أنواع الأخطاء المعرفة في النظام
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTH = 'auth',
  DATA = 'data',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  TIMEOUT = 'timeout',
  CORS = 'cors',
  SUPABASE = 'supabase',
  UNKNOWN = 'unknown'
}

// واجهة موحدة للأخطاء
export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  code?: string | number;
  context?: Record<string, unknown>;
  retryable: boolean;
  vercelSpecific?: boolean;
}

/**
 * دالة لتصنيف الأخطاء وتوحيدها
 */
export function classifyError(error: unknown): AppError {
  // تسجيل الخطأ الأصلي للأغراض التشخيصية
  console.warn("تصنيف الخطأ:", error);
  
  // الكشف عما إذا كان الخطأ متعلقاً بـ Vercel
  const isVercel = isRunningOnVercel();
  
  // التعامل مع أخطاء إلغاء الطلب والمهلة
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      type: ErrorType.TIMEOUT,
      message: 'تم إلغاء الطلب بسبب تجاوز المهلة الزمنية',
      originalError: error,
      retryable: true,
      vercelSpecific: isVercel
    };
  }
  
  // التعامل مع أخطاء الشبكة
  if (error instanceof TypeError && (
      error.message.includes('fetch') || 
      error.message.includes('network') || 
      error.message.includes('Failed to fetch')
    )) {
    return {
      type: ErrorType.NETWORK,
      message: 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت',
      originalError: error,
      retryable: true,
      vercelSpecific: isVercel && error.message.includes('CORS')
    };
  }

  // التعامل مع أخطاء CORS
  if (error instanceof Error && (
      error.message.includes('CORS') || 
      error.message.includes('cross-origin') ||
      error.message.includes('access-control-allow-origin')
    )) {
    return {
      type: ErrorType.CORS,
      message: 'خطأ في سياسة CORS، يتعذر الوصول إلى المصدر',
      originalError: error,
      retryable: true,
      vercelSpecific: isVercel
    };
  }

  // التعامل مع أخطاء Supabase
  if (error instanceof Error && (
      error.message.includes('supabase') || 
      error.message.includes('postgres') ||
      (error as any)?.code?.startsWith('PGRST')
    )) {
    const code = (error as any)?.code;
    return {
      type: ErrorType.SUPABASE,
      message: `خطأ في الاتصال بـ Supabase: ${error.message}`,
      code: code,
      originalError: error,
      retryable: !code?.includes('PGRST30'), // أخطاء المصادقة غير قابلة للإعادة عادةً
      vercelSpecific: isVercel
    };
  }

  // التعامل مع أخطاء الخادم
  if (error instanceof Response || (error as any)?.status >= 400) {
    const status = (error as Response)?.status || (error as any)?.status;
    
    if (status === 401 || status === 403) {
      return {
        type: ErrorType.AUTH,
        message: 'غير مصرح لك بالوصول إلى هذا المورد',
        code: status,
        originalError: error,
        retryable: false,
        vercelSpecific: isVercel
      };
    }
    
    if (status === 429) {
      return {
        type: ErrorType.SERVER,
        message: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقًا',
        code: status,
        originalError: error,
        retryable: true,
        vercelSpecific: isVercel
      };
    }
    
    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقًا',
        code: status,
        originalError: error,
        retryable: true,
        vercelSpecific: isVercel
      };
    }
    
    return {
      type: ErrorType.SERVER,
      message: `خطأ في الخادم (${status})`,
      code: status,
      originalError: error,
      retryable: status < 500,
      vercelSpecific: isVercel
    };
  }

  // التعامل مع الأخطاء المتعلقة بالبيانات
  if (
    error instanceof SyntaxError ||
    (error instanceof Error && 
     (error.message.includes('JSON') || 
      error.message.includes('parse') || 
      error.message.includes('data')))
  ) {
    return {
      type: ErrorType.DATA,
      message: 'خطأ في تنسيق البيانات المستلمة',
      originalError: error,
      retryable: false,
      vercelSpecific: isVercel
    };
  }

  // التعامل مع تجاوز المهلة
  if (
    error instanceof Error && 
    (error.message.includes('timeout') || 
     error.message.includes('مهلة') || 
     error.message.includes('تجاوز الوقت'))
  ) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'تجاوز الطلب للوقت المحدد، يرجى المحاولة مرة أخرى',
      originalError: error,
      retryable: true,
      vercelSpecific: isVercel
    };
  }

  // التعامل مع أنواع الأخطاء الأخرى
  if (error instanceof Error) {
    // فحص رسائل الخطأ للتصنيف
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('تحقق') || errorMsg.includes('validation') || errorMsg.includes('صالح')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        originalError: error,
        retryable: false,
        vercelSpecific: isVercel
      };
    }
    
    if (errorMsg.includes('تخزين') || errorMsg.includes('storage') || errorMsg.includes('file')) {
      return {
        type: ErrorType.STORAGE,
        message: 'حدث خطأ أثناء معالجة الملفات',
        originalError: error,
        retryable: true,
        vercelSpecific: isVercel
      };
    }
    
    if (errorMsg.includes('شبكة') || errorMsg.includes('اتصال') || errorMsg.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message: 'مشكلة في الاتصال بالشبكة',
        originalError: error,
        retryable: true,
        vercelSpecific: isVercel
      };
    }
  }

  // الأخطاء غير المصنفة
  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
    originalError: error,
    retryable: true,
    vercelSpecific: isVercel
  };
}

/**
 * دالة مساعدة لمعالجة الأخطاء وعرض إشعارات للمستخدم
 */
export function handleError(error: unknown, context: string = ''): AppError {
  const appError = classifyError(error);
  
  console.error(`خطأ في ${context || 'التطبيق'}:`, appError);
  
  // عرض إشعار مخصص للمستخدم بناءً على نوع الخطأ
  const toastDuration = appError.vercelSpecific ? 7000 : 5000; // إطالة مدة الإشعار لأخطاء Vercel
  
  // تجنب عرض إشعارات متكررة للأخطاء المتشابهة
  const toastId = `error-${appError.type}-${Date.now()}`;
  
  toast({
    id: toastId,
    title: getErrorTitle(appError.type),
    description: appError.vercelSpecific 
      ? `${appError.message} (يبدو أن هذا الخطأ خاص بـ Vercel)` 
      : appError.message,
    variant: "destructive",
    duration: toastDuration,
  });
  
  return appError;
}

/**
 * الحصول على عنوان مناسب للخطأ بناءً على نوعه
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return 'خطأ في الاتصال';
    case ErrorType.SERVER:
      return 'خطأ في الخادم';
    case ErrorType.AUTH:
      return 'خطأ في المصادقة';
    case ErrorType.DATA:
      return 'خطأ في البيانات';
    case ErrorType.VALIDATION:
      return 'خطأ في التحقق';
    case ErrorType.STORAGE:
      return 'خطأ في التخزين';
    case ErrorType.TIMEOUT:
      return 'تجاوز الوقت المحدد';
    case ErrorType.CORS:
      return 'خطأ في سياسة CORS';
    case ErrorType.SUPABASE:
      return 'خطأ في Supabase';
    default:
      return 'خطأ غير متوقع';
  }
}
