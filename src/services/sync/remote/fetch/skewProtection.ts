
/**
 * حماية من انحراف الوقت في الخوادم
 * Protection from time skew on servers
 */

/**
 * التحقق مما إذا كان التطبيق يعمل على Vercel
 * Check if app is running on Vercel
 */
export const isRunningOnVercel = (): boolean => {
  // التحقق من وجود بعض القيم التي قد تكون متاحة فقط على Vercel
  try {
    // نحاول الكشف عن بيئة Vercel من خلال بعض العلامات
    const hostname = window.location.hostname;
    return hostname.endsWith('.vercel.app') || 
           hostname.includes('vercel') || 
           document.querySelector('meta[name="generator"][content*="vercel"]') !== null;
  } catch (e) {
    return false;
  }
};

/**
 * الحصول على معلمات الحماية من انحراف الوقت
 * Get time skew protection parameters
 */
export const getSkewProtectionParams = (): string => {
  try {
    // إضافة طابع زمني دقيق لتجنب مشاكل انحراف الوقت في الخوادم
    const timestamp = Date.now();
    const adjustedTime = timestamp; // يمكن تعديله وفقًا لانحراف وقت الخادم المعروف
    
    if (isRunningOnVercel()) {
      // إضافة مزيد من المعلمات خاصة بـ Vercel
      return `_vercel=${adjustedTime}&_ts=${timestamp}&_precise=${new Date().toISOString()}`;
    }
    
    return `_ts=${timestamp}`;
  } catch (e) {
    return `_ts=${Date.now()}`;
  }
};
