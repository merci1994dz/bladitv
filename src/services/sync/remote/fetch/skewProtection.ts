
/**
 * وظائف حماية الانحراف الزمني
 * Time skew protection functions
 */

/**
 * الحصول على معلمات حماية الانحراف
 * Get skew protection parameters
 * 
 * @returns معلمات الانحراف الزمني
 */
export const getSkewProtectionParams = (): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  
  return `skew=${timestamp}&id=${randomId}`;
};

/**
 * التحقق مما إذا كان التطبيق يعمل على Vercel
 * Check if the app is running on Vercel
 * 
 * @returns دائمًا يرجع false حيث لم يعد هناك حاجة للتمييز
 */
export const isRunningOnVercel = (): boolean => {
  // نحن لم نعد نستخدم المنطق الخاص بـ Vercel، لذلك سنعيد دائمًا false
  // We no longer use Vercel-specific logic, so always return false
  return false;
};
