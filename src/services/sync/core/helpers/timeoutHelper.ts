
/**
 * وظائف مساعدة للتعامل مع المهلات الزمنية
 * Helper functions for handling timeouts
 */

/**
 * إنشاء وعد مع مهلة زمنية
 * Create a promise with a timeout
 */
export const createTimeoutPromise = (timeout: number): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn(`تم تجاوز المهلة الزمنية (${timeout}ms)`);
      resolve(false);
    }, timeout);
  });
};

/**
 * تنفيذ وظيفة مع مهلة زمنية
 * Execute a function with a timeout
 */
export const executeWithTimeout = async <T>(
  fn: () => Promise<T>,
  timeout: number,
  fallbackValue: T
): Promise<T> => {
  const timeoutPromise = new Promise<T>((resolve) => {
    setTimeout(() => {
      console.warn(`تم تجاوز المهلة الزمنية (${timeout}ms) للوظيفة`);
      resolve(fallbackValue);
    }, timeout);
  });
  
  return Promise.race([fn(), timeoutPromise]);
};

/**
 * تأخير بوعد
 * Delay with a promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * التحقق من فترة الانتظار بين المحاولات المتتالية
 * Check the cooldown period between consecutive attempts
 * 
 * @param lastAttemptTime وقت آخر محاولة
 * @param cooldownMs فترة الانتظار المطلوبة بالمللي ثانية
 * @returns ما إذا كانت فترة الانتظار قد انتهت
 */
export const isCooldownComplete = (
  lastAttemptTime: number,
  cooldownMs: number = 5000
): boolean => {
  const now = Date.now();
  const timeSinceLastAttempt = now - lastAttemptTime;
  return timeSinceLastAttempt >= cooldownMs;
};

/**
 * حساب وقت الانتظار المتكيف بناءً على عدد المحاولات
 * Calculate adaptive wait time based on attempt count
 * 
 * @param attemptCount عدد المحاولات
 * @param baseDelayMs التأخير الأساسي بالمللي ثانية
 * @param maxDelayMs الحد الأقصى للتأخير بالمللي ثانية
 * @returns وقت الانتظار المحسوب بالمللي ثانية
 */
export const calculateAdaptiveWaitTime = (
  attemptCount: number,
  baseDelayMs: number = 2000,
  maxDelayMs: number = 30000
): number => {
  // استخدام تأخير تصاعدي مع عنصر عشوائي صغير
  const exponentialDelay = baseDelayMs * Math.pow(1.5, attemptCount - 1);
  const jitter = Math.random() * 1000; // إضافة تغيير عشوائي بين 0-1000 مللي ثانية
  
  // تحديد التأخير ضمن الحد الأقصى
  return Math.min(exponentialDelay + jitter, maxDelayMs);
};
