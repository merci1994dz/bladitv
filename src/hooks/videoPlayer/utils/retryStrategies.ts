
/**
 * استراتيجيات إعادة المحاولة للفيديو
 */

/**
 * حساب التأخير المناسب للمحاولة التالية باستخدام التراجع الأسي
 * @param retryCount عدد مرات المحاولة
 * @param baseDelay التأخير الأساسي بالمللي ثانية
 * @param maxDelay الحد الأقصى للتأخير
 * @returns التأخير بالمللي ثانية
 */
export const calculateExponentialDelay = (
  retryCount: number,
  baseDelay: number = 1000,
  maxDelay: number = 8000
): number => {
  // زيادة مدة التأخير بين المحاولات المتتالية بشكل أسي
  return Math.min(
    baseDelay * Math.pow(2, retryCount), 
    maxDelay
  );
};

/**
 * إنشاء وظيفة مؤقتة مع إلغاء
 * @param callback الدالة التي سيتم تنفيذها بعد التأخير
 * @param delay مدة التأخير بالمللي ثانية
 * @returns وظيفة لإلغاء المؤقت
 */
export const createCancellableTimeout = (
  callback: () => void, 
  delay: number
): () => void => {
  const timeoutId = setTimeout(callback, delay);
  return () => clearTimeout(timeoutId);
};

/**
 * التحقق من صلاحية فترة إعادة المحاولة
 * @param lastRetryTime وقت آخر محاولة
 * @param minRetryInterval الحد الأدنى للفاصل الزمني بين المحاولات
 * @returns ما إذا كان يمكن إعادة المحاولة الآن
 */
export const canRetryNow = (
  lastRetryTime: number,
  minRetryInterval: number = 3000
): boolean => {
  const now = Date.now();
  return now - lastRetryTime >= minRetryInterval;
};

/**
 * حساب مدة التأخير المتبقية قبل إمكانية إعادة المحاولة
 * @param lastRetryTime وقت آخر محاولة
 * @param minRetryInterval الحد الأدنى للفاصل الزمني بين المحاولات
 * @returns مدة التأخير المتبقية بالمللي ثانية
 */
export const getDelayUntilNextRetry = (
  lastRetryTime: number,
  minRetryInterval: number = 3000
): number => {
  const now = Date.now();
  const elapsedTime = now - lastRetryTime;
  
  return Math.max(0, minRetryInterval - elapsedTime);
};
