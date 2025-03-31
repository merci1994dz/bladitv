
/**
 * وظائف مساعدة للتعامل مع المهل الزمنية والتأخيرات
 * Helper functions for handling timeouts and delays
 */

/**
 * التحقق مما إذا كانت فترة الانتظار قد اكتملت
 * Check if cooldown period is complete
 * 
 * @param lastTime آخر وقت للنشاط
 * @param cooldownMs فترة الانتظار بالمللي ثانية
 * @returns ما إذا كانت فترة الانتظار قد اكتملت
 */
export const isCooldownComplete = (lastTime: number, cooldownMs: number): boolean => {
  const now = Date.now();
  return now - lastTime > cooldownMs;
};

/**
 * إنشاء وعد مع مهلة زمنية
 * Create a promise with timeout
 * 
 * @param timeoutMs المهلة الزمنية بالمللي ثانية
 * @returns وعد يتم رفضه بعد انتهاء المهلة الزمنية
 */
export const createTimeoutPromise = (timeoutMs: number): Promise<boolean> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`تم تجاوز المهلة الزمنية (${timeoutMs}ms)`));
    }, timeoutMs);
  });
};

/**
 * حساب وقت الانتظار التكيفي بناءً على عدد المحاولات
 * Calculate adaptive wait time based on number of attempts
 * 
 * @param attempts عدد المحاولات
 * @returns وقت الانتظار بالمللي ثانية
 */
export const calculateAdaptiveWaitTime = (attempts: number): number => {
  // وقت انتظار أساسي 5 ثوانٍ
  // Base wait time 5 seconds
  const baseWaitTime = 5000;
  
  // زيادة وقت الانتظار بشكل تدريجي مع زيادة عدد المحاولات
  // Gradually increase wait time with more attempts
  // استخدام مضاعف أسي لتحقيق تباطؤ أكثر مع كل محاولة فاشلة
  // Use exponential multiplier to achieve more backoff with each failed attempt
  const multiplier = Math.min(Math.pow(1.5, attempts), 10);
  
  // إضافة تباين عشوائي (± 20%)
  // Add random jitter (± 20%)
  const jitterFactor = 0.8 + (Math.random() * 0.4);
  
  // حساب وقت الانتظار النهائي
  // Calculate final wait time
  const waitTime = baseWaitTime * multiplier * jitterFactor;
  
  // الحد الأقصى لوقت الانتظار هو 5 دقائق
  // Max wait time is 5 minutes
  return Math.min(Math.round(waitTime), 5 * 60 * 1000);
};
