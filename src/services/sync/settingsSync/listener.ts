
/**
 * مستمع لتحديثات الإعدادات
 * Settings update listener
 */

import { syncData } from '../index';
import { getLastSyncTime } from '../status/timestamp';

// مفتاح تخزين وقت آخر تحقق من الإعدادات
// Storage key for last settings check time
const LAST_SETTINGS_CHECK_KEY = 'last_settings_check';

/**
 * إعداد مستمع لمزامنة الإعدادات
 * Setup settings sync listener
 */
export const setupSettingsSyncListener = (): void => {
  try {
    // تعيين فترة التحقق (بالمللي ثانية)
    // Set check interval (in milliseconds)
    const checkInterval = 60000; // كل دقيقة
    
    // وظيفة التحقق من تحديثات الإعدادات
    // Function to check for settings updates
    const checkForSettingsUpdates = async () => {
      try {
        // التحقق من وقت آخر تحقق
        // Check for last check time
        const lastCheckStr = localStorage.getItem(LAST_SETTINGS_CHECK_KEY);
        const lastCheck = lastCheckStr ? parseInt(lastCheckStr, 10) : 0;
        const now = Date.now();
        
        // إذا مر وقت كافٍ منذ آخر تحقق
        // If enough time has passed since last check
        if (now - lastCheck > checkInterval) {
          // تحديث وقت آخر تحقق
          // Update last check time
          localStorage.setItem(LAST_SETTINGS_CHECK_KEY, now.toString());
          
          // فحص التحديثات
          // Check for updates
          console.log('التحقق من تحديثات الإعدادات...');
          
          // محاولة المزامنة
          // Try to sync
          await syncData();
        }
      } catch (error) {
        console.error('خطأ في التحقق من تحديثات الإعدادات:', error);
      }
    };
    
    // إعداد فترة التحقق
    // Setup check interval
    const intervalId = setInterval(checkForSettingsUpdates, checkInterval);
    
    // إضافة مستمع لحدث تحديث الإعدادات
    // Add listener for settings update event
    const handleSettingsUpdate = async (event: CustomEvent) => {
      try {
        console.log('تم استلام حدث تحديث الإعدادات:', event.detail);
        
        // تحديث وقت آخر تحقق
        // Update last check time
        localStorage.setItem(LAST_SETTINGS_CHECK_KEY, Date.now().toString());
        
        // محاولة المزامنة
        // Try to sync
        await syncData(true);
      } catch (error) {
        console.error('خطأ في معالجة تحديث الإعدادات:', error);
      }
    };
    
    window.addEventListener('settings_updated', handleSettingsUpdate as EventListener);
    
    // إضافة وظيفة التنظيف عند تفريغ الصفحة
    // Add cleanup function when page unloads
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
      window.removeEventListener('settings_updated', handleSettingsUpdate as EventListener);
    });
    
    // تشغيل التحقق الأولي بعد فترة قصيرة
    // Run initial check after short delay
    setTimeout(checkForSettingsUpdates, 5000);
  } catch (error) {
    console.error('خطأ في إعداد مستمع مزامنة الإعدادات:', error);
  }
};
