
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
  RECENTLY_WATCHED: 'recently_watched_channels',
  
  // إعدادات المزامنة
  REMOTE_CONFIG: 'tv_remote_config',
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
};

// إعدادات الأمان
export const SECURITY_CONFIG = {
  DISABLE_VIDEO_DOWNLOAD: true, // منع تنزيل الفيديو
  DISABLE_RIGHT_CLICK: true, // منع النقر بزر الماوس الأيمن
  DISABLE_INSPECT: true, // منع فتح أدوات المطور
};

// أوقات التأخير والمهل الزمنية (بالمللي ثانية)
export const TIMEOUTS = {
  HIDE_CONTROLS: 3000, // إخفاء أزرار التحكم بعد 3 ثوانٍ
  SYNC_INTERVAL: 15 * 60 * 1000, // 15 دقيقة
};

// إعدادات المزامنة عن بعد
export const REMOTE_CONFIG = {
  ENABLED: true, // تفعيل المزامنة عن بعد
  CHECK_INTERVAL: 60 * 60 * 1000, // ساعة واحدة
  DEFAULT_URL: '', // الرابط الافتراضي للمزامنة
};

// بيانات الإصدار
export const APP_VERSION = 'v1.2.0';

// كلمة مرور المسؤول الافتراضية
export const DEFAULT_ADMIN_PASSWORD = 'admin123';
