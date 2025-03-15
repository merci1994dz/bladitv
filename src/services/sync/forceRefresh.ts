
import { saveChannelsToStorage } from '../dataStore';
import { syncAllData } from './coreSync';

// تحسين دالة التحديث القسري - تضمن تحديث جميع البيانات
export const forceDataRefresh = async (): Promise<boolean> => {
  console.log('بدء عملية التحديث القسري للبيانات...');
  
  try {
    // مسح بيانات القنوات من التخزين المحلي لفرض التحديث
    localStorage.removeItem('last_sync_time');
    localStorage.removeItem('last_sync');
    
    // فرض إعادة تحميل البيانات المخزنة مؤقتًا
    const timestamp = Date.now().toString();
    localStorage.setItem('force_refresh', timestamp);
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('data_version', timestamp);
    localStorage.setItem('channels_last_update', timestamp);
    
    // حفظ القنوات الحالية لضمان تضمينها في التخزين المحلي
    saveChannelsToStorage();
    
    // محاولة إجراء المزامنة القسرية
    const success = await syncAllData(true);
    
    // إضافة علامات خاصة متعددة لاكتشاف التغييرات
    const newTimestamp = Date.now().toString(); // استخدام طابع زمني جديد
    localStorage.setItem('bladi_info_update', newTimestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('refresh_timestamp', newTimestamp);
    localStorage.setItem('bladi_force_refresh', 'true');
    localStorage.setItem('final_update_check', newTimestamp);
    
    // محاولة استخدام sessionStorage أيضًا
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('reload_time', newTimestamp);
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // محاولة استخدام cookies أيضًا
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `reload_time=${newTimestamp}; path=/;`;
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // إجبار المتصفح على إعادة التحميل لإظهار البيانات الجديدة
    if (success) {
      // إضافة تأخير مناسب لضمان اكتمال المزامنة
      setTimeout(() => {
        // إضافة معلمة URL لمنع التخزين المؤقت أثناء إعادة التحميل
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
      }, 1500);
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في التحديث القسري:', error);
    return false;
  }
};
