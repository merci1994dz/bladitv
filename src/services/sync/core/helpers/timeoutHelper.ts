
/**
 * وظائف مساعدة للتعامل مع المهل الزمنية والتأخير
 * Helper functions for timeout and delay handling
 */

/**
 * إنشاء وعد مع مهلة زمنية
 * Create a promise with a timeout
 */
export const createTimeoutPromise = (timeoutMs: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, timeoutMs);
  });
};

/**
 * التحقق مما إذا اكتملت فترة الانتظار
 * Check if cooldown period is complete
 */
export const isCooldownComplete = (lastTime: number, cooldownMs: number): boolean => {
  return Date.now() - lastTime >= cooldownMs;
};

/**
 * حساب وقت الانتظار التكيفي بناءً على عدد المحاولات الفاشلة
 * Calculate adaptive wait time based on failure count
 */
export const calculateAdaptiveWaitTime = (failureCount: number): number => {
  // زيادة وقت الانتظار تدريجيًا مع زيادة عدد الفشل
  // 5 ثوانٍ للمحاولة الأولى، ثم 15 ثانية، ثم 30 ثانية، ثم دقيقة واحدة
  const baseWaitTimeMs = 5000;
  
  if (failureCount <= 1) {
    return baseWaitTimeMs;
  } else if (failureCount === 2) {
    return 15000; // 15 ثانية
  } else if (failureCount === 3) {
    return 30000; // 30 ثانية
  } else {
    return 60000; // دقيقة واحدة
  }
};
