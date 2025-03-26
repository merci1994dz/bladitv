
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
