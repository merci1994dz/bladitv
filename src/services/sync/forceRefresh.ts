
/**
 * دالة لإجبار إعادة تحميل البيانات وإعادة مزامنتها لجميع المستخدمين
 * Function to force data reload and resync for all users
 */

import { syncAllData } from './coreSync';
import { loadFromLocalStorage } from '../dataStore';
import { forceBroadcastToAllBrowsers } from './publish';

export const forceDataRefresh = async (): Promise<boolean> => {
  console.log('بدء التحديث القسري للبيانات... / Starting forced data refresh...');
  
  try {
    // 1. إعادة تحميل البيانات من التخزين المحلي
    // 1. Reload data from local storage
    const reloadResult = loadFromLocalStorage();
    console.log('نتيجة إعادة تحميل البيانات: / Data reload result:', reloadResult);
    
    // 2. إضافة مؤشرات للتحديث القسري بطريقة محسنة
    // 2. Add enhanced indicators for forced update
    const timestamp = Date.now().toString();
    
    // علامات متعددة لزيادة فرص الاكتشاف مع تنوع أكبر
    // Multiple diverse flags to increase discovery chances
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
      'channels_last_update',
      'force_app_reload',
      'cache_breaker',
      'app_update_required',
      'refresh_timestamp',
      'cache_bust_time',        // مفتاح جديد
      'content_refresh_signal', // مفتاح جديد
      'hard_refresh_trigger',   // مفتاح جديد
      'data_refresh_marker',    // مفتاح جديد
      'app_reload_marker'       // مفتاح جديد
    ];
    
    // تطبيق جميع العلامات مع إدخال بعض التأخير العشوائي بينها
    // Apply all flags with some random delay between them
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const delay = Math.floor(Math.random() * 50); // تأخير عشوائي بين 0-50 مللي ثانية
      
      setTimeout(() => {
        if (key.includes('force') || key.includes('refresh') || key.includes('reload') || key.includes('trigger')) {
          localStorage.setItem(key, 'true');
        } else {
          localStorage.setItem(key, `${timestamp}_${Math.random().toString(36).substring(2, 9)}`);
        }
      }, delay);
    }
    
    // 3. محاولة إضافة مؤشرات في sessionStorage
    // 3. Try to add indicators in sessionStorage
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('force_update', 'true');
      sessionStorage.setItem('data_version', timestamp);
      sessionStorage.setItem('app_refresh', 'true');
      sessionStorage.setItem('cache_breaker', timestamp);
      sessionStorage.setItem('cache_bust_time', timestamp); // مفتاح جديد
    } catch (e) {
      // تجاهل الأخطاء هنا / Ignore errors here
    }
    
    // 4. محاولة استخدام cookies مع أسماء متنوعة
    // 4. Try using cookies with diverse names
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `force_update=true; path=/;`;
      document.cookie = `data_version=${timestamp}; path=/;`;
      document.cookie = `nocache_version=${timestamp}; path=/;`;
      document.cookie = `app_refresh=true; path=/;`;
      document.cookie = `cache_bust=${timestamp}; path=/;`; // مفتاح جديد
      document.cookie = `refresh_signal=${timestamp}; path=/;`; // مفتاح جديد
    } catch (e) {
      // تجاهل الأخطاء هنا / Ignore errors here
    }
    
    // 5. تنفيذ المزامنة القسرية
    // 5. Execute forced sync
    await syncAllData(true);
    
    // 6. محاولة بث التحديث لجميع المتصفحات
    // 6. Try broadcasting update to all browsers
    await forceBroadcastToAllBrowsers(true);
    
    // 7. إعادة تحميل الصفحة بعد تأخير كاف
    // 7. Reload page after sufficient delay
    setTimeout(() => {
      try {
        // محاولة تحديث الصفحة مع منع التخزين المؤقت بشكل قوي
        const baseUrl = window.location.href.split('?')[0];
        const cacheBuster = `refresh=${timestamp}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 9)}&v=${Date.now()}`;
        window.location.href = `${baseUrl}?${cacheBuster}`;
      } catch (e) {
        // محاولة استخدام طريقة تحديث بديلة
        try {
          // إجبار إعادة التحميل - تم إزالة المعامل للتوافق مع المتصفحات الحديثة
          window.location.reload();
        } catch (e2) {
          // طريقة أخيرة
          window.location = window.location;
        }
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('خطأ في التحديث القسري للبيانات: / Error in forced data refresh:', error);
    
    // محاولة إعادة تحميل الصفحة على أي حال في حالة الفشل
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return false;
  }
};

// دالة جديدة للتحديث الفوري للبيانات والمتصفح بطريقة محسنة
// New function for immediate data and browser refresh with enhanced method
export const immediateRefresh = (): void => {
  console.log('تنفيذ تحديث فوري وإعادة تحميل...');
  
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  
  // إنشاء علامات متعددة للتأكد من التحديث
  const refreshMarkers = {
    'force_browser_refresh': 'true',
    'nocache_version': timestamp,
    'data_version': timestamp,
    'force_update': 'true',
    'cache_bust_time': timestamp,
    'hard_refresh_trigger': 'true',
    'refresh_marker': `${timestamp}_${random}`
  };
  
  // تطبيق جميع العلامات
  Object.entries(refreshMarkers).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      document.cookie = `${key}=${value}; path=/;`;
    } catch (e) {
      // تجاهل أي أخطاء
    }
  });
  
  // تطبيق علامات إضافية في التخزين المحلي
  try {
    localStorage.setItem('app_reload_marker', timestamp);
    localStorage.setItem('content_refresh_signal', 'true');
  } catch (e) {
    // تجاهل أي أخطاء
  }
  
  // إعادة تحميل الصفحة مع معلمات متنوعة لمنع التخزين المؤقت
  try {
    const baseUrl = window.location.href.split('?')[0];
    const cacheBuster = `refresh=${timestamp}&nocache=${Date.now()}&t=${Date.now()}&r=${random}&v=${Date.now()}&ts=${new Date().toISOString()}`;
    window.location.href = `${baseUrl}?${cacheBuster}`;
  } catch (e) {
    // محاولة طريقة بديلة
    try {
      // تحديث الرابط المباشر
      window.location = new URL(window.location.href.split('?')[0] + `?bust=${Date.now()}`);
    } catch (e2) {
      // طريقة أخيرة بسيطة
      window.location.reload();
    }
  }
};
