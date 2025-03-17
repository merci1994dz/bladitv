
import { syncAllData } from './coreSync';
import { loadFromLocalStorage } from '../dataStore';
import { forceBroadcastToAllBrowsers } from './publishOperations';

// دالة لإجبار إعادة تحميل البيانات وإعادة مزامنتها لجميع المستخدمين
export const forceDataRefresh = async (): Promise<boolean> => {
  console.log('بدء التحديث القسري للبيانات...');
  
  try {
    // 1. إعادة تحميل البيانات من التخزين المحلي
    const reloadResult = loadFromLocalStorage();
    console.log('نتيجة إعادة تحميل البيانات:', reloadResult);
    
    // 2. إضافة مؤشرات للتحديث القسري
    const timestamp = Date.now().toString();
    
    // علامات متعددة لزيادة فرص الاكتشاف
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
    keys.forEach(key => {
      if (key.includes('force') || key.includes('refresh') || key.includes('reload')) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.setItem(key, timestamp);
      }
    });
    
    // 3. محاولة إضافة مؤشرات في sessionStorage
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('force_update', 'true');
      sessionStorage.setItem('data_version', timestamp);
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // 4. محاولة استخدام cookies أيضًا
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `force_update=true; path=/;`;
      document.cookie = `data_version=${timestamp}; path=/;`;
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // 5. تنفيذ المزامنة القسرية
    await syncAllData(true);
    
    // 6. محاولة بث التحديث لجميع المتصفحات
    await forceBroadcastToAllBrowsers();
    
    // 7. إعادة تحميل الصفحة بعد تأخير كاف
    setTimeout(() => {
      try {
        // محاولة تحديث الصفحة مع منع التخزين المؤقت
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
      } catch (e) {
        // محاولة استخدام طريقة تحديث بديلة
        try {
          window.location.reload();
        } catch (e2) {
          console.error('فشلت جميع محاولات تحديث الصفحة:', e2);
        }
      }
    }, 1500);
    
    return true;
  } catch (error) {
    console.error('خطأ في التحديث القسري للبيانات:', error);
    return false;
  }
};
