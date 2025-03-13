// Local storage keys
export const STORAGE_KEYS = {
  CHANNELS: 'tv_channels',
  COUNTRIES: 'tv_countries',
  CATEGORIES: 'tv_categories',
  LAST_SYNC: 'tv_last_sync',
  ADMIN_PASSWORD: 'tv_admin_password',
  USER_SETTINGS: 'tv_user_settings',
  REMOTE_CONFIG: 'tv_remote_config'
};

// Default admin password - will be saved to localStorage
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

// App version
export const APP_VERSION = 'v1.3.2';

// Video Player settings
export const VIDEO_PLAYER = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1500,
  CONTROLS_HIDE_DELAY: 3000,
  HIDE_STREAM_URLS: true,            // إخفاء روابط البث
  OBFUSCATE_SOURCE: true,            // تشفير مصدر البث
  USE_PROXY: false,                  // استخدام وسيط لإخفاء المصدر (يتطلب إعداد خادم)
  DISABLE_INSPECT: true,             // منع فتح أدوات المطور
  REFERRER_PROTECTION: true          // حماية الإحالة
};

// تكوين إضافي للأمان
export const SECURITY_CONFIG = {
  ALLOW_RIGHT_CLICK: false,          // منع النقر بالزر الأيمن
  DISABLE_VIDEO_DOWNLOAD: true,      // منع تحميل الفيديو
  LOG_ACCESS_ATTEMPTS: true          // تسجيل محاولات الوصول غير المصرح بها
};

// تكوين التحديث عن بُعد
export const REMOTE_CONFIG = {
  ENABLED: true,                     // تمكين التحديث عن بُعد
  CHECK_INTERVAL: 1000 * 60 * 60,    // تحقق من التحديثات كل ساعة (بالميلي ثانية)
  REMOTE_URL: '',                    // عنوان URL للتكوين عن بُعد (يتم تعيينه من واجهة المستخدم)
  LAST_CHECK: null                   // وقت آخر تحقق من التحديثات
};
