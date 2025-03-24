
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
