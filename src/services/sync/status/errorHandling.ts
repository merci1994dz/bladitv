
/**
 * مسؤول عن إدارة أخطاء المزامنة وتخزينها
 */

import { STORAGE_KEYS } from '../../config';
import { toast } from '@/hooks/use-toast';

interface SyncErrorData {
  message: string;
  timestamp: number;
  source?: string;
  retryable?: boolean;
  attemptCount?: number;
  code?: string | number;
  details?: Record<string, any>;
}

/**
 * تعيين خطأ المزامنة مع معلومات إضافية
 */
export const setSyncError = (
  error: string | null,
  options?: {
    source?: string;
    retryable?: boolean;
    attemptCount?: number;
    code?: string | number;
    details?: Record<string, any>;
  }
): void => {
  try {
    if (error) {
      const errorData: SyncErrorData = {
        message: error,
        timestamp: Date.now(),
        ...options
      };
      localStorage.setItem(STORAGE_KEYS.SYNC_ERROR, JSON.stringify(errorData));
      
      // إذا كان الخطأ حرجًا، أظهر إشعارًا
      if (options?.details?.critical) {
        toast({
          title: "خطأ حرج في المزامنة",
          description: error,
          variant: "destructive",
          duration: 10000, // عرض لمدة أطول للأخطاء الحرجة
        });
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.SYNC_ERROR);
    }
  } catch (e) {
    console.error('خطأ في تعيين خطأ المزامنة:', e);
  }
};

/**
 * مسح خطأ المزامنة
 */
export const clearSyncError = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SYNC_ERROR);
  } catch (e) {
    console.error('خطأ في مسح خطأ المزامنة:', e);
  }
};

/**
 * جلب آخر خطأ مزامنة
 */
export const getSyncError = (): SyncErrorData | null => {
  try {
    const errorJson = localStorage.getItem(STORAGE_KEYS.SYNC_ERROR);
    if (!errorJson) return null;
    
    return JSON.parse(errorJson);
  } catch (e) {
    console.error('خطأ في جلب خطأ المزامنة:', e);
    return null;
  }
};

/**
 * زيادة عداد محاولات التزامن المتعلقة بالخطأ الحالي
 */
export const incrementSyncErrorAttempts = (): number => {
  try {
    const currentError = getSyncError();
    if (!currentError) return 0;
    
    const currentAttempts = currentError.attemptCount || 0;
    const newAttempts = currentAttempts + 1;
    
    setSyncError(currentError.message, {
      source: currentError.source,
      retryable: currentError.retryable,
      attemptCount: newAttempts,
      code: currentError.code,
      details: currentError.details
    });
    
    // إظهار إشعار عند تجاوز عدد معين من المحاولات
    if (newAttempts === 3 || newAttempts === 5) {
      toast({
        title: `فشلت ${newAttempts} محاولات متتالية`,
        description: "تعذر الاتصال بمصادر البيانات. سيتم استخدام البيانات المحلية.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    return newAttempts;
  } catch (e) {
    console.error('خطأ في زيادة عداد محاولات المزامنة:', e);
    return 0;
  }
};

/**
 * تحقق مما إذا كان الخطأ الحالي قابل لإعادة المحاولة
 */
export const isSyncErrorRetryable = (): boolean => {
  try {
    const currentError = getSyncError();
    if (!currentError) return false;
    
    // إذا تم تحديد قابلية إعادة المحاولة صراحةً، استخدمها
    if (typeof currentError.retryable === 'boolean') {
      return currentError.retryable;
    }
    
    // التحقق من رسالة الخطأ لتحديد ما إذا كان قابلاً لإعادة المحاولة
    const message = currentError.message.toLowerCase();
    return (
      message.includes('شبكة') ||
      message.includes('اتصال') ||
      message.includes('مهلة') ||
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connect') ||
      message.includes('fetch') ||
      message.includes('retry')
    );
  } catch (e) {
    console.error('خطأ في التحقق من قابلية إعادة المحاولة:', e);
    return false;
  }
};

/**
 * الحصول على تفاصيل مشكلة المزامنة بتنسيق ملائم للمستخدم
 */
export const getFormattedErrorDetails = (): { title: string; description: string } => {
  try {
    const currentError = getSyncError();
    if (!currentError) {
      return {
        title: "غير معروف",
        description: "حدث خطأ غير معروف"
      };
    }
    
    // تصنيف الأخطاء بناءً على الرسالة
    const message = currentError.message.toLowerCase();
    
    if (message.includes('cors') || message.includes('origin')) {
      return {
        title: "خطأ CORS",
        description: "تعذر الوصول إلى مصادر البيانات بسبب قيود الأمان. جرب مصدرًا آخر."
      };
    }
    
    if (message.includes('timeout') || message.includes('مهلة') || message.includes('تجاوز')) {
      return {
        title: "انتهاء المهلة",
        description: "استغرقت عملية المزامنة وقتًا طويلاً. تحقق من سرعة اتصالك."
      };
    }
    
    if (message.includes('network') || message.includes('شبكة') || message.includes('اتصال')) {
      return {
        title: "خطأ في الشبكة",
        description: "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت."
      };
    }
    
    if (message.includes('authentication') || message.includes('مصادقة') || message.includes('login')) {
      return {
        title: "خطأ في المصادقة",
        description: "تعذر مصادقة الطلب. قد تحتاج إلى إعادة تسجيل الدخول."
      };
    }
    
    if (message.includes('quota') || message.includes('حصة') || message.includes('exceeded')) {
      return {
        title: "تجاوز الحصة",
        description: "تم تجاوز حد الطلبات المسموح به. حاول مرة أخرى لاحقًا."
      };
    }
    
    // الرسالة الافتراضية
    return {
      title: "خطأ في المزامنة",
      description: currentError.message.length > 100 
        ? currentError.message.substring(0, 100) + "..." 
        : currentError.message
    };
  } catch (e) {
    console.error('خطأ في تنسيق تفاصيل المزامنة:', e);
    return {
      title: "خطأ غير متوقع",
      description: "حدث خطأ غير متوقع أثناء معالجة بيانات الخطأ"
    };
  }
};

/**
 * تسجيل خطأ مزامنة جديد مع إشعار اختياري
 */
export const logSyncError = (
  error: unknown,
  source: string = 'sync',
  showToast: boolean = false
): void => {
  // تحويل الخطأ إلى رسالة نصية
  let errorMessage: string;
  let errorCode: string | number | undefined;
  let errorDetails: Record<string, any> = {};
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails.stack = error.stack;
    // استخراج الكود من الخطأ إن وجد
    const anyError = error as any;
    if (anyError.code) {
      errorCode = anyError.code;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    const anyError = error as any;
    errorMessage = anyError.message || JSON.stringify(error);
    if (anyError.code) {
      errorCode = anyError.code;
    }
    errorDetails = { ...anyError };
  } else {
    errorMessage = 'خطأ غير معروف';
  }
  
  // تحديد ما إذا كان الخطأ قابلاً لإعادة المحاولة
  const isRetryable = 
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('timeout') ||
    errorMessage.toLowerCase().includes('connection') ||
    errorMessage.toLowerCase().includes('fetch');
  
  // تعيين الخطأ
  setSyncError(errorMessage, {
    source,
    retryable: isRetryable,
    attemptCount: 1,
    code: errorCode,
    details: errorDetails
  });
  
  // إظهار إشعار إذا تم طلب ذلك
  if (showToast) {
    const { title, description } = getFormattedErrorDetails();
    toast({
      title,
      description,
      variant: "destructive",
      duration: 5000,
    });
  }
  
  // تسجيل في وحدة التحكم
  console.error(`[${source}] خطأ في المزامنة:`, error);
};
