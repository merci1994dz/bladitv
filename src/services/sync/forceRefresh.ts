
import { syncAllData } from './coreSync';
import { loadFromLocalStorage } from '../dataStore';
import { forceBroadcastToAllBrowsers } from './publishOperations';

/**
 * دالة لإجبار إعادة تحميل البيانات وإعادة مزامنتها لجميع المستخدمين
 * Function to force data reload and resync for all users
 */
export const forceDataRefresh = async (): Promise<boolean> => {
  console.log('بدء التحديث القسري للبيانات... / Starting forced data refresh...');
  
  try {
    // 1. إعادة تحميل البيانات من التخزين المحلي
    // 1. Reload data from local storage
    const reloadResult = loadFromLocalStorage();
    console.log('نتيجة إعادة تحميل البيانات: / Data reload result:', reloadResult);
    
    // 2. إضافة مؤشرات للتحديث القسري
    // 2. Add indicators for forced update
    const timestamp = Date.now().toString();
    
    // علامات متعددة لزيادة فرص الاكتشاف
    // Multiple flags to increase discovery chances
    const keys = [
      'force_update',
      'force_refresh',
      'force_browser_refresh',
      'force_reload',
      'nocache_version',
      'data_version',
      'channels_update_by_cms',
      'bladi_info_update',
      'bladi_update_version',
      'channels_last_update'
    ];
    
    // تطبيق جميع العلامات
    // Apply all flags
    keys.forEach(key => {
      if (key.includes('force') || key.includes('refresh') || key.includes('reload')) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.setItem(key, timestamp);
      }
    });
    
    // 3. محاولة إضافة مؤشرات في sessionStorage
    // 3. Try to add indicators in sessionStorage
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('force_update', 'true');
      sessionStorage.setItem('data_version', timestamp);
    } catch (e) {
      // تجاهل الأخطاء هنا / Ignore errors here
    }
    
    // 4. محاولة استخدام cookies أيضًا
    // 4. Try using cookies as well
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `force_update=true; path=/;`;
      document.cookie = `data_version=${timestamp}; path=/;`;
    } catch (e) {
      // تجاهل الأخطاء هنا / Ignore errors here
    }
    
    // 5. تنفيذ المزامنة القسرية
    // 5. Execute forced sync
    await syncAllData(true);
    
    // 6. محاولة بث التحديث لجميع المتصفحات
    // 6. Try broadcasting update to all browsers
    await forceBroadcastToAllBrowsers();
    
    // 7. إعادة تحميل الصفحة بعد تأخير كاف
    // 7. Reload page after sufficient delay
    setTimeout(() => {
      try {
        // محاولة تحديث الصفحة مع منع التخزين المؤقت
        // Try to refresh page with cache prevention
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
      } catch (e) {
        // محاولة استخدام طريقة تحديث بديلة
        // Try using alternative refresh method
        try {
          window.location.reload();
        } catch (e2) {
          console.error('فشلت جميع محاولات تحديث الصفحة: / All page refresh attempts failed:', e2);
        }
      }
    }, 1500);
    
    return true;
  } catch (error) {
    console.error('خطأ في التحديث القسري للبيانات: / Error in forced data refresh:', error);
    return false;
  }
};
