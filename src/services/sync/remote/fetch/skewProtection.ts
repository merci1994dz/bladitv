
/**
 * حماية من انحراف الوقت في الخوادم
 * Protection from time skew on servers
 */

/**
 * الحصول على معلمات الحماية من انحراف الوقت
 * Get time skew protection parameters
 */
export const getSkewProtectionParams = (): string => {
  try {
    // إضافة طابع زمني دقيق لتجنب مشاكل انحراف الوقت في الخوادم
    const timestamp = Date.now();
    const adjustedTime = timestamp; // يمكن تعديله وفقًا لانحراف وقت الخادم المعروف
    
    return `_ts=${timestamp}`;
  } catch (e) {
    return `_ts=${Date.now()}`;
  }
};
