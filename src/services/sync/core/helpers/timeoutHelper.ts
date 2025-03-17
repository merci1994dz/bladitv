
/**
 * مساعدات لإنشاء مهلات زمنية للمزامنة
 * Helpers for creating sync timeouts
 */

/**
 * إنشاء وعد مهلة زمنية
 * Create timeout promise
 * 
 * @param timeout المهلة بالمللي ثانية / Timeout in milliseconds
 * @returns وعد يتم حله بـ false بعد انتهاء المهلة / Promise that resolves to false after timeout
 */
export function createTimeoutPromise(timeout: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn('تم تجاوز الوقت المخصص للمزامنة / Sync timeout exceeded');
      
      // محاولة تحديث ذاكرة التخزين المؤقت للمتصفح عند انتهاء المهلة
      try {
        localStorage.setItem('force_browser_refresh', 'true');
        localStorage.setItem('nocache_version', Date.now().toString());
        localStorage.setItem('data_version', Date.now().toString());
      } catch (e) {
        console.error('فشل في تعيين علامات التحديث عند انتهاء المهلة', e);
      }
      
      resolve(false);
    }, timeout);
  });
}
