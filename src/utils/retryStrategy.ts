
/**
 * استراتيجيات إعادة المحاولة
 * Retry strategies
 */

/**
 * احتساب زمن الانتظار التصاعدي بين المحاولات
 * Calculate exponential backoff wait time between retries
 * 
 * @param retryCount عدد المحاولات الحالي / Current retry count
 * @param baseDelay التأخير الأساسي (بالمللي ثانية) / Base delay (in ms)
 * @param maxDelay الحد الأقصى للتأخير (بالمللي ثانية) / Maximum delay (in ms)
 * @returns وقت الانتظار (بالمللي ثانية) / Wait time (in ms)
 */
export const getExponentialBackoff = (
  retryCount: number, 
  baseDelay: number = 1000, 
  maxDelay: number = 30000
): number => {
  // حساب التأخير التصاعدي مع عنصر عشوائي
  // Calculate exponential delay with randomization
  const delay = Math.min(
    maxDelay,
    baseDelay * Math.pow(2, retryCount) * (1 + Math.random() * 0.1)
  );
  
  return delay;
};

/**
 * استراتيجية إعادة المحاولة الخطية
 * Linear retry strategy
 */
export const getLinearBackoff = (
  retryCount: number,
  increment: number = 1000,
  maxDelay: number = 10000
): number => {
  return Math.min(maxDelay, increment * retryCount);
};

/**
 * تحديد ما إذا كان يجب إعادة المحاولة بناءً على نوع الخطأ
 * Determine if retry should be attempted based on error type
 */
export const shouldRetry = (error: unknown): boolean => {
  if (error instanceof Error) {
    // أخطاء الشبكة والاتصال قابلة لإعادة المحاولة
    // Network and connection errors are retryable
    const isNetworkError = 
      error.message.includes('network') ||
      error.message.includes('internet') ||
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.message.includes('fetch');
    
    // أخطاء CORS قابلة لإعادة المحاولة بطريقة مختلفة
    // CORS errors might be retryable with a different strategy
    const isCorsError = 
      error.message.includes('CORS') ||
      error.message.includes('cross-origin');
    
    // أخطاء التحقق من الصحة غير قابلة لإعادة المحاولة عادةً
    // Validation errors usually not retryable
    const isValidationError = 
      error.message.includes('validation') ||
      error.message.includes('invalid');
      
    return isNetworkError || isCorsError;
  }
  
  // إعادة المحاولة بشكل افتراضي للأخطاء غير المعروفة
  // Default to retry for unknown errors
  return true;
};

/**
 * خيارات إعادة المحاولة
 * Retry options interface
 */
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  maxDelay: number;
  retryOnNetworkError?: boolean;
  retryOnServerError?: boolean;
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * دالة إعادة المحاولة المتقدمة
 * Advanced retry function with configurable options
 * 
 * @param fn الدالة المراد إعادة محاولتها / Function to retry
 * @param options خيارات إعادة المحاولة / Retry options
 * @returns نتيجة استدعاء الدالة / Result of the function call
 */
export const retry = async <T>(
  fn: () => Promise<T>, 
  options: RetryOptions | (() => RetryOptions)
): Promise<T> => {
  const resolvedOptions = typeof options === 'function' ? options() : options;
  
  const {
    maxRetries,
    initialDelay,
    backoffFactor,
    maxDelay,
    retryOnNetworkError = true,
    retryOnServerError = true,
    onRetry
  } = resolvedOptions;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // إذا كانت هذه هي المحاولة الأخيرة، رمي الخطأ
      // If this was the last attempt, throw the error
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // تحديد ما إذا كان يجب إعادة المحاولة بناءً على نوع الخطأ
      // Determine if retry should happen based on error type
      const isNetworkError = error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('internet') ||
        error.message.includes('connection') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout')
      );
      
      const isServerError = error instanceof Error && (
        error.message.includes('500') ||
        error.message.includes('503') ||
        error.message.includes('server')
      );
      
      const shouldRetryBasedOnErrorType = 
        (retryOnNetworkError && isNetworkError) || 
        (retryOnServerError && isServerError);
      
      if (!shouldRetryBasedOnErrorType) {
        throw error;
      }
      
      // حساب التأخير للمحاولة التالية
      // Calculate delay for next attempt
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      // استدعاء دالة رد النداء إذا تم توفيرها
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt + 1, delay);
      }
      
      // الانتظار قبل المحاولة التالية
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // لن يتم الوصول إلى هذا الجزء، ولكنه ضروري للتجميع
  // This point should never be reached, but necessary for compilation
  throw lastError;
};

/**
 * انشاء استراتيجية إعادة المحاولة التدريجية
 * Create a progressive retry strategy with increasing delays
 * 
 * @param maxRetries عدد المحاولات الأقصى / Maximum number of retries
 * @param withRandomization إضافة عنصر عشوائي للتأخير / Add randomization to delay
 * @returns خيارات إعادة المحاولة / Retry options
 */
export const createProgressiveRetryStrategy = (
  maxRetries: number = 3,
  withRandomization: boolean = false
): RetryOptions => {
  return {
    maxRetries,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 15000,
    retryOnNetworkError: true,
    retryOnServerError: true,
    onRetry: (error, attempt, delay) => {
      console.log(`إعادة محاولة (${attempt}/${maxRetries}) بعد ${delay}ms`, error);
    }
  };
};

