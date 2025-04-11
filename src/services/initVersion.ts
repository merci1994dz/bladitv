
/**
 * تهيئة الإصدار وضمان عرض أحدث البيانات
 * Version initialization and ensuring latest data display
 */

import { ensureLatestVersion } from '@/utils/cacheControl';

/**
 * التحقق من الحاجة لتطبيق إجراءات ضمان عرض أحدث إصدار
 * Check if version enforcement is needed
 */
const isVersionEnforcementNeeded = (): boolean => {
  try {
    // التحقق من وجود علامة تطبيق الإجراءات مسبقًا
    const enforcedTimestamp = localStorage.getItem('latest_version_time');
    if (!enforcedTimestamp) {
      return true;
    }
    
    // التحقق من مرور وقت كافٍ منذ آخر تطبيق
    const lastEnforced = new Date(enforcedTimestamp).getTime();
    const now = Date.now();
    const timeSinceLastEnforced = now - lastEnforced;
    
    // إذا مر أكثر من ساعة، تطبيق الإجراءات مجددًا
    const ONE_HOUR = 60 * 60 * 1000;
    return timeSinceLastEnforced > ONE_HOUR;
  } catch (error) {
    console.warn('خطأ في التحقق من الحاجة لتطبيق إجراءات ضمان عرض أحدث إصدار:', error);
    return true;  // في حالة الشك، تطبيق الإجراءات
  }
};

/**
 * تهيئة الإصدار عند بدء التطبيق
 * Initialize version on application start
 */
export const initializeVersion = async (): Promise<void> => {
  try {
    console.log('بدء تهيئة الإصدار...');
    
    // التحقق من الحاجة لتطبيق إجراءات ضمان عرض أحدث إصدار
    if (isVersionEnforcementNeeded()) {
      console.log('تطبيق إجراءات ضمان عرض أحدث إصدار...');
      await ensureLatestVersion();
    } else {
      console.log('لا حاجة لتطبيق إجراءات ضمان عرض أحدث إصدار');
    }
    
    // إضافة مستمع لتحديث الإصدار عند إعادة تحميل الصفحة
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('app_reload_timestamp', Date.now().toString());
    });
    
    console.log('تم الانتهاء من تهيئة الإصدار');
  } catch (error) {
    console.error('خطأ في تهيئة الإصدار:', error);
  }
};

// تنفيذ تهيئة الإصدار
initializeVersion().catch(console.error);
