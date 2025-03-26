
/**
 * استراتيجيات إعادة المحاولة المتقدمة
 */

interface RetryOptions {
  maxRetries: number;           // عدد مرات إعادة المحاولة القصوى
  initialDelay: number;         // التأخير الأولي بالمللي ثانية
  maxDelay?: number;            // الحد الأقصى للتأخير
  backoffFactor?: number;       // معامل زيادة التأخير (للتراجع الأسي)
  retryOnNetworkError?: boolean; // إعادة المحاولة عند أخطاء الشبكة
  retryOnServerError?: boolean;  // إعادة المحاولة عند أخطاء الخادم (5xx)
  onRetry?: (error: unknown, attempt: number, delay: number) => void; // دالة تنفذ عند كل إعادة محاولة
  onFinalFailure?: (error: unknown, attempts: number) => void; // دالة تنفذ عند فشل جميع المحاولات
}

/**
 * دالة متطورة لإعادة محاولة تنفيذ الوظائف المتزامنة مع آلية تأخير تراجعي
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay = 30000,
    backoffFactor = 2,
    retryOnNetworkError = true,
    retryOnServerError = true,
    onRetry,
    onFinalFailure
  } = options;
  
  let attempts = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      
      // التحقق مما إذا كان يجب إعادة المحاولة
      const shouldRetry = (
        attempts < maxRetries && 
        (
          (retryOnNetworkError && isNetworkError(error)) ||
          (retryOnServerError && isServerError(error)) ||
          shouldRetryError(error)
        )
      );
      
      if (!shouldRetry) {
        // إذا استنفدت جميع المحاولات، استدعاء دالة الفشل النهائي ورمي الخطأ
        if (onFinalFailure) {
          onFinalFailure(error, attempts);
        }
        throw error;
      }
      
      // حساب التأخير قبل المحاولة التالية (باستخدام التراجع الأسي مع عنصر عشوائي)
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempts - 1) + Math.random() * 1000,
        maxDelay
      );
      
      // استدعاء دالة معالجة إعادة المحاولة
      if (onRetry) {
        onRetry(error, attempts, delay);
      }
      
      // الانتظار قبل المحاولة التالية
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * حساب وقت الانتظار للتراجع الأسي
 * @param attempt رقم المحاولة الحالية
 * @param initialDelay التأخير الأولي بالمللي ثانية
 * @param maxDelay الحد الأقصى للتأخير بالمللي ثانية
 */
export function getExponentialBackoff(
  attempt: number,
  initialDelay: number = 1000,
  maxDelay: number = 30000
): number {
  // حساب التأخير باستخدام الصيغة الأسية مع عنصر عشوائي
  const calculatedDelay = initialDelay * Math.pow(2, attempt - 1);
  
  // إضافة تغيير عشوائي (jitter) لمنع تزامن الطلبات
  const jitter = Math.random() * 0.3 * calculatedDelay;
  
  // تطبيق الحد الأقصى
  return Math.min(calculatedDelay + jitter, maxDelay);
}

/**
 * فحص ما إذا كان الخطأ متعلقًا بالشبكة
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase();
    return (
      errorMsg.includes('network') ||
      errorMsg.includes('شبكة') ||
      errorMsg.includes('اتصال') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('مهلة')
    );
  }
  
  return false;
}

/**
 * فحص ما إذا كان الخطأ متعلقًا بالخادم (5xx)
 */
function isServerError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status >= 500 && error.status < 600;
  }
  
  if ((error as any)?.status >= 500 && (error as any)?.status < 600) {
    return true;
  }
  
  return false;
}

/**
 * فحص أنواع الأخطاء الأخرى التي يمكن إعادة المحاولة فيها
 */
function shouldRetryError(error: unknown): boolean {
  // التحقق من كائنات الخطأ المخصصة
  if ((error as any)?.retryable === true) {
    return true;
  }
  
  if ((error as any)?.retry === false) {
    return false;
  }
  
  // تحقق من رسائل الخطأ الخاصة
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase();
    return (
      errorMsg.includes('retry') ||
      errorMsg.includes('إعادة محاولة') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('مهلة') ||
      errorMsg.includes('temporary') ||
      errorMsg.includes('مؤقت')
    );
  }
  
  return false;
}

/**
 * دالة مساعدة لإنشاء إستراتيجية إعادة محاولة متدرجة
 */
export function createProgressiveRetryStrategy(
  initialRetries: number = 3,
  criticalOperation: boolean = false
): RetryOptions {
  return {
    maxRetries: criticalOperation ? initialRetries + 2 : initialRetries,
    initialDelay: 1000,
    backoffFactor: 1.5,
    maxDelay: criticalOperation ? 60000 : 30000,
    retryOnNetworkError: true,
    retryOnServerError: true,
    onRetry: (error, attempt, delay) => {
      console.log(`إعادة محاولة ${attempt}/${criticalOperation ? initialRetries + 2 : initialRetries} بعد ${delay}ms`, error);
    }
  };
}
