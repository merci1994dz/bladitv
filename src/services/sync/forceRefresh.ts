
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
      'app_reload_marker',      // مفتاح جديد
      'aggressive_cache_bust',  // مفتاح إضافي جديد
      'total_cache_clear',      // مفتاح إضافي جديد
      'clear_page_cache'        // مفتاح إضافي جديد
    ];
    
    // تطبيق جميع العلامات بشكل فوري وبدون تأخير
    // Apply all flags immediately without delay
    for (const key of keys) {
      try {
        if (key.includes('force') || key.includes('refresh') || key.includes('reload') || key.includes('trigger') || key.includes('clear')) {
          localStorage.setItem(key, 'true');
        } else {
          localStorage.setItem(key, `${timestamp}_${Math.random().toString(36).substring(2, 9)}`);
        }
      } catch (e) {
        console.error('خطأ في تعيين مفتاح التحديث:', key, e);
      }
    }
    
    // تطبيق مباشر على sessionStorage
    // Direct application to sessionStorage
    try {
      const sessionKeys = ['force_reload', 'force_update', 'data_version', 'app_refresh', 'cache_breaker', 'cache_bust_time'];
      for (const key of sessionKeys) {
        sessionStorage.setItem(key, key.includes('version') || key.includes('time') ? timestamp : 'true');
      }
    } catch (e) {
      console.error('خطأ في تعيين مفاتيح التحديث في sessionStorage:', e);
    }
    
    // تطبيق على cookies بشكل مباشر
    // Apply directly to cookies
    try {
      const cookieKeys = ['force_reload', 'force_update', 'data_version', 'nocache_version', 'app_refresh', 'cache_bust', 'refresh_signal'];
      for (const key of cookieKeys) {
        const value = key.includes('version') || key.includes('bust') || key.includes('signal') ? timestamp : 'true';
        document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`;
      }
    } catch (e) {
      console.error('خطأ في تعيين مفاتيح التحديث في cookies:', e);
    }
    
    // 5. تنفيذ المزامنة القسرية
    // 5. Execute forced sync
    await syncAllData(true);
    
    // 6. محاولة بث التحديث لجميع المتصفحات
    // 6. Try broadcasting update to all browsers
    await forceBroadcastToAllBrowsers(true);
    
    // مسح التخزين المؤقت للصفحة قبل إعادة التحميل
    // Clear page cache before reload
    try {
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
            console.log('تم مسح التخزين المؤقت:', cacheName);
          });
        });
      }
    } catch (e) {
      console.error('خطأ في مسح التخزين المؤقت للصفحة:', e);
    }
    
    // 7. إعادة تحميل الصفحة بعد تأخير كاف مع معلمات قوية لمنع التخزين المؤقت
    // 7. Reload page after sufficient delay with strong cache busting parameters
    setTimeout(() => {
      try {
        // محاولة تحديث الصفحة مع منع التخزين المؤقت بشكل قوي
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const cacheBuster = `refresh=${timestamp}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 9)}&v=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
        
        // إضافة معلمات قوية لمنع التخزين المؤقت
        window.location.href = `${baseUrl}?${cacheBuster}`;
        
        // محاولة إجبار المتصفح على تجاهل التخزين المؤقت
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Cache-Control';
        meta.content = 'no-cache, no-store, must-revalidate';
        document.head.appendChild(meta);
        
        const pragmaMeta = document.createElement('meta');
        pragmaMeta.httpEquiv = 'Pragma';
        pragmaMeta.content = 'no-cache';
        document.head.appendChild(pragmaMeta);
      } catch (e) {
        console.error('خطأ في إعادة تحميل الصفحة مع منع التخزين المؤقت:', e);
        
        // محاولة استخدام طريقة تحديث بديلة
        try {
          window.location.reload();
        } catch (e2) {
          console.error('خطأ في إعادة تحميل الصفحة بالطريقة البديلة:', e2);
          
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
    'refresh_marker': `${timestamp}_${random}`,
    'aggressive_cache_bust': 'true', // علامة جديدة
    'total_cache_clear': 'true',     // علامة جديدة
    'clear_page_cache': 'true'       // علامة جديدة
  };
  
  // تطبيق جميع العلامات
  Object.entries(refreshMarkers).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`;
    } catch (e) {
      // تجاهل أي أخطاء
      console.error('خطأ في تعيين مفتاح تحديث:', key, e);
    }
  });
  
  // مسح التخزين المؤقت للصفحة إذا كان متاحًا
  try {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          console.log('تم مسح التخزين المؤقت:', cacheName);
        });
      });
    }
  } catch (e) {
    console.error('خطأ في مسح التخزين المؤقت للصفحة:', e);
  }
  
  // إعادة تحميل الصفحة مع معلمات متنوعة لمنع التخزين المؤقت
  try {
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const cacheBuster = `refresh=${timestamp}&nocache=${Date.now()}&t=${Date.now()}&r=${random}&v=${Date.now()}&ts=${new Date().toISOString()}&_=${Math.random().toString(36).substring(2, 15)}`;
    
    // إضافة معلمات قوية لمنع التخزين المؤقت
    window.location.href = `${baseUrl}?${cacheBuster}`;
    
    // إضافة عناصر meta لمنع التخزين المؤقت
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
    
    const pragmaMeta = document.createElement('meta');
    pragmaMeta.httpEquiv = 'Pragma';
    pragmaMeta.content = 'no-cache';
    document.head.appendChild(pragmaMeta);
  } catch (e) {
    // محاولة طريقة بديلة
    try {
      // استخدام window.location.href مباشرة
      const currentUrl = window.location.href.split('?')[0];
      window.location.href = `${currentUrl}?bust=${Date.now()}&r=${Math.random()}`;
    } catch (e2) {
      // طريقة أخيرة بسيطة
      window.location.reload();
    }
  }
};

// إضافة دالة جديدة لمسح التخزين المؤقت للصفحة
// Add new function to clear page cache
export const clearPageCache = async (): Promise<boolean> => {
  try {
    console.log('محاولة مسح التخزين المؤقت للصفحة...');
    
    // مسح التخزين المؤقت للصفحة إذا كان متاحًا
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('تم مسح كل التخزين المؤقت للصفحة');
    }
    
    // إضافة معلمات تحكم في التخزين المؤقت
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
    
    const pragmaMeta = document.createElement('meta');
    pragmaMeta.httpEquiv = 'Pragma';
    pragmaMeta.content = 'no-cache';
    document.head.appendChild(pragmaMeta);
    
    const expiresMeta = document.createElement('meta');
    expiresMeta.httpEquiv = 'Expires';
    expiresMeta.content = '0';
    document.head.appendChild(expiresMeta);
    
    return true;
  } catch (error) {
    console.error('خطأ في مسح التخزين المؤقت للصفحة:', error);
    return false;
  }
};
