
// قائمة بمفاتيح التخزين التي تؤدي إلى إجراءات المزامنة
export const SYNC_TRIGGER_KEYS = [
  'tv_channels',
  'bladi_info_update',
  'data_version',
  'force_browser_refresh',
  'force_refresh',
  'channels_last_update',
  'channels_updated_at',
  'bladi_update_version',
  'bladi_update_channels',
  'bladi_force_refresh',
  'settings_updated',
  'refresh_timestamp',
  'update_notification',
  'delayed_update',
  'final_update_check',
  'nocache_version',
  'app_update_required',
  'force_app_reload'
];

// مفاتيح تؤدي إلى إعادة تحميل الصفحة بالكامل
export const RELOAD_TRIGGER_KEYS = [
  'force_browser_refresh',
  'bladi_force_refresh',
  'force_app_reload',
  'app_update_required'
];

// فترات زمنية للمزامنة (بالمللي ثانية)
export const SYNC_INTERVALS = {
  DEBOUNCE: 200,       // فترة التأخير لتجميع الأحداث المتكررة
  PERIODIC_CHECK: 3 * 60 * 1000,  // 3 دقائق
  RELOAD_DELAY: 300,   // تأخير قبل إعادة تحميل الصفحة
  BROADCAST_DELAY: 200 // تأخير بين بث التغييرات
};
