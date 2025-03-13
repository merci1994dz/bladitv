
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
  REMOTE_ADMIN_CONFIG: 'remote_admin_config',
  LAST_SYNC_TIME: 'last_sync_time',
};

// إعدادات مشغل الفيديو
export const VIDEO_PLAYER = {
  DEFAULT_VOLUME: 0.5,
  AUTOPLAY: true,
  HIDE_STREAM_URLS: false, // لإخفاء روابط البث المباشر
  HLS_CONFIG: {
    enableWorker: true,
    startLevel: 0,
    debug: false,
  },
};

// أوقات التأخير والمهل الزمنية (بالمللي ثانية)
export const TIMEOUTS = {
  HIDE_CONTROLS: 3000, // إخفاء أزرار التحكم بعد 3 ثوانٍ
  SYNC_INTERVAL: 15 * 60 * 1000, // 15 دقيقة
};

