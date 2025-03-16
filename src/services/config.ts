
// إعدادات التطبيق

// مفاتيح التخزين المحلي
export const STORAGE_KEYS = {
  // مفاتيح التخزين المحلي للبيانات
  CHANNELS: 'channels_data',
  COUNTRIES: 'countries_data',
  CATEGORIES: 'categories_data',
  
  // مفاتيح أخرى
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  ADMIN_PASSWORD: 'admin_password',
  ADMIN_ACCESS_TOKEN: 'admin_access_token', // توكن جديد للمصادقة
  ADMIN_LOGIN_ATTEMPTS: 'admin_login_attempts', // عدد محاولات تسجيل الدخول
  RECENTLY_WATCHED: 'recently_watched_channels',
  USER_SETTINGS: 'user_settings',
  PROGRAM_GUIDE: 'program_guide_data',
  DEVICE_INFO: 'device_info',
  ADMIN_FULL_ACCESS: 'admin_full_access', // مفتاح جديد للصلاحيات الكاملة
  
  // إعدادات المزامنة
  REMOTE_CONFIG: 'tv_remote_config',
  REMOTE_ADMIN_CONFIG: 'tv_remote_config',
  LAST_SYNC_TIME: 'last_sync_time',
  LAST_SYNC: 'last_sync', // Adding this key for backward compatibility
};

// إعدادات مشغل الفيديو
export const VIDEO_PLAYER = {
  DEFAULT_VOLUME: 0.5,
  AUTOPLAY: true,
  HIDE_STREAM_URLS: false, // لإخفاء روابط البث المباشر
  DISABLE_INSPECT: true, // لتعطيل أدوات المطور
  OBFUSCATE_SOURCE: true, // لإخفاء مصدر البث
  USE_PROXY: false, // لاستخدام وسيط للبث
  HLS_CONFIG: {
    enableWorker: true,
    startLevel: 0,
    debug: false,
  },
  // إعدادات التلفزيون الجديدة
  TV_CONTROLS: {
    BIG_BUTTONS: true,
    SHOW_HELP: true,
    ENHANCED_NAVIGATION: true
  },
  // جودة البث
  QUALITY_LEVELS: [
    { id: 'auto', name: 'تلقائي', bitrate: 0 },
    { id: 'low', name: 'منخفضة', bitrate: 800000 },
    { id: 'medium', name: 'متوسطة', bitrate: 1500000 },
    { id: 'high', name: 'عالية', bitrate: 3000000 },
    { id: 'ultra', name: 'فائقة', bitrate: 6000000 }
  ]
};

// إعدادات الأمان
export const SECURITY_CONFIG = {
  DISABLE_VIDEO_DOWNLOAD: true, // منع تنزيل الفيديو
  DISABLE_RIGHT_CLICK: true, // منع النقر بزر الماوس الأيمن
  DISABLE_INSPECT: true, // منع فتح أدوات المطور
  ADMIN_PROTECTION: {
    MAX_LOGIN_ATTEMPTS: 5, // الحد الأقصى لمحاولات تسجيل الدخول
    LOCK_TIME: 30 * 60 * 1000, // وقت القفل (30 دقيقة)
    SESSION_TIMEOUT: 60 * 60 * 1000, // مهلة الجلسة (ساعة واحدة)
    FULL_ACCESS_DURATION: 180 * 24 * 60 * 60 * 1000, // مدة الصلاحيات الكاملة (6 أشهر)
  },
  PARENTAL_CONTROL: {
    ENABLED: false,
    PIN_PROTECTED: false,
    DEFAULT_PIN: '0000'
  }
};

// أوقات التأخير والمهل الزمنية (بالمللي ثانية)
export const TIMEOUTS = {
  HIDE_CONTROLS: 3000, // إخفاء أزرار التحكم بعد 3 ثوانٍ
  SYNC_INTERVAL: 15 * 60 * 1000, // 15 دقيقة
  GUIDE_REFRESH: 3 * 60 * 60 * 1000, // تحديث دليل البرامج كل 3 ساعات
};

// إعدادات المزامنة عن بعد
export const REMOTE_CONFIG = {
  ENABLED: true, // تفعيل المزامنة عن بعد
  CHECK_INTERVAL: 60 * 60 * 1000, // ساعة واحدة
  DEFAULT_URL: '', // الرابط الافتراضي للمزامنة
  MULTI_DEVICE_SYNC: true, // مزامنة متعددة الأجهزة
};

// بيانات الإصدار
export const APP_VERSION = 'v1.3.0';

// كلمة مرور المسؤول الافتراضية - تم تغييرها لتكون أكثر أمانًا
export const DEFAULT_ADMIN_PASSWORD = 'Secure_Admin_2024!';
