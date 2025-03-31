
/**
 * وظائف بث تحديثات الإعدادات
 * Settings updates broadcast functions
 */

/**
 * بث تحديث الإعدادات
 * Broadcast settings update
 */
export const broadcastSettingsUpdate = (settings: Record<string, any>): void => {
  try {
    console.log('بث تحديث الإعدادات:', settings);
    
    // حفظ البيانات في التخزين المحلي
    // Save data to local storage
    const timestamp = Date.now();
    localStorage.setItem('settings_update_timestamp', timestamp.toString());
    localStorage.setItem('settings_update_data', JSON.stringify(settings));
    
    // إطلاق حدث تحديث الإعدادات
    // Dispatch settings update event
    const event = new CustomEvent('settings_updated', {
      detail: { settings, timestamp }
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('خطأ في بث تحديث الإعدادات:', error);
  }
};

/**
 * إجبار إعادة تحميل التطبيق لجميع المستخدمين
 * Force app reload for all users
 */
export const forceAppReloadForAllUsers = (): void => {
  try {
    console.log('إجبار إعادة تحميل التطبيق لجميع المستخدمين...');
    
    // تعيين علامات إعادة التحميل القسري
    // Set force reload flags
    const timestamp = Date.now();
    localStorage.setItem('force_app_reload', 'true');
    localStorage.setItem('force_app_reload_timestamp', timestamp.toString());
    
    // إطلاق حدث إعادة تحميل التطبيق
    // Dispatch app reload event
    const event = new CustomEvent('force_app_reload', {
      detail: { timestamp }
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('خطأ في إجبار إعادة تحميل التطبيق لجميع المستخدمين:', error);
  }
};
