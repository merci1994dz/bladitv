
/**
 * مرافق متقدمة لمعالجة الأخطاء وإعادة المحاولة
 */

import { toast } from '@/hooks/use-toast';

// أنواع الأخطاء المعرفة في النظام
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTH = 'auth',
  DATA = 'data',
  VALIDATION = 'validation',
  STORAGE = 'storage',
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
}

/**
 * دالة لتصنيف الأخطاء وتوحيدها
 */
export function classifyError(error: unknown): AppError {
  // التعامل مع أخطاء الشبكة
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت',
      originalError: error,
      retryable: true
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
        retryable: false
      };
    }
    
    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقًا',
        code: status,
        originalError: error,
        retryable: true
      };
    }
    
    return {
      type: ErrorType.SERVER,
      message: 'حدث خطأ في الخادم',
      code: status,
      originalError: error,
      retryable: status < 500
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
      retryable: false
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
        retryable: false
      };
    }
    
    if (errorMsg.includes('تخزين') || errorMsg.includes('storage') || errorMsg.includes('file')) {
      return {
        type: ErrorType.STORAGE,
        message: 'حدث خطأ أثناء معالجة الملفات',
        originalError: error,
        retryable: true
      };
    }
    
    if (errorMsg.includes('شبكة') || errorMsg.includes('اتصال') || errorMsg.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message: 'مشكلة في الاتصال بالشبكة',
        originalError: error,
        retryable: true
      };
    }
  }

  // الأخطاء غير المصنفة
  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
    originalError: error,
    retryable: true
  };
}

/**
 * دالة مساعدة لمعالجة الأخطاء وعرض إشعارات للمستخدم
 */
export function handleError(error: unknown, context: string = ''): AppError {
  const appError = classifyError(error);
  
  console.error(`خطأ في ${context}:`, appError);
  
  // عرض إشعار للمستخدم
  toast({
    title: getErrorTitle(appError.type),
    description: appError.message,
    variant: "destructive",
    duration: 5000,
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
    default:
      return 'خطأ غير متوقع';
  }
}
