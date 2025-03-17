
import { saveChannelsToStorage } from '../../dataStore';
import { syncAllData } from '../coreSync';
import { clearPageCache } from '../forceRefresh';

/**
 * Forces a broadcast to all browsers with synchronized data
 * @param skipReload - When true, prevents automatic page reload after synchronization
 * @returns Promise resolving to boolean indicating success
 */
export const forceBroadcastToAllBrowsers = async (skipReload: boolean = false): Promise<boolean> => {
  console.log('بدء النشر القسري والقوي لجميع المتصفحات...');
  
  try {
    // 1. Save current data
    saveChannelsToStorage();
    
    // 2. Create unique update ID
    const updateId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // 3. Send multiple diverse signals simultaneously without delays
    const signals = [
      { key: 'force_browser_refresh', value: 'true' },
      { key: 'bladi_force_refresh', value: 'true' },
      { key: 'data_version', value: updateId },
      { key: 'bladi_info_update', value: updateId },
      { key: 'channels_last_update', value: updateId },
      { key: 'update_broadcast_id', value: updateId },
      { key: 'force_update', value: 'true' },
      { key: 'refresh_timestamp', value: updateId },
      { key: 'cache_breaker', value: updateId },
      { key: 'nocache_version', value: updateId },
      { key: 'aggressive_cache_bust', value: 'true' },
      { key: 'total_cache_clear', value: 'true' },
      { key: 'clear_page_cache', value: 'true' }
    ];
    
    // Apply all signals immediately
    signals.forEach(signal => {
      try {
        localStorage.setItem(signal.key, signal.value);
        console.log(`تم إرسال إشارة: ${signal.key} = ${signal.value}`);
        
        // Try sessionStorage too
        try {
          sessionStorage.setItem(signal.key, signal.value);
        } catch (e) {
          // Ignore sessionStorage errors
        }
        
        // Try cookies too
        try {
          document.cookie = `${signal.key}=${signal.value}; path=/; max-age=3600; SameSite=Lax`;
        } catch (e) {
          // Ignore cookie errors
        }
      } catch (e) {
        console.warn(`فشل في إرسال إشارة ${signal.key}:`, e);
      }
    });
    
    // 4. Clear page cache if possible
    await clearPageCache();
    
    // 5. Apply forced sync
    await syncAllData(true);
    
    // 6. Send final signal after sync completion
    localStorage.setItem('sync_complete', updateId);
    localStorage.setItem('force_browser_refresh', 'true');
    
    // 7. Force reload of current page with cache busting parameters only if skipReload is false
    if (!skipReload) {
      setTimeout(() => {
        try {
          // مسح التخزين المؤقت للصفحة إذا أمكن
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
              });
            });
          }
          
          // إضافة meta tags لمنع التخزين المؤقت
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Cache-Control';
          meta.content = 'no-cache, no-store, must-revalidate';
          document.head.appendChild(meta);
          
          // إعادة تحميل الصفحة بمعلمات متعددة لمنع التخزين المؤقت
          const baseUrl = window.location.href.split('?')[0].split('#')[0];
          const cacheBuster = `refresh=${updateId}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 15)}&v=${Date.now()}&ts=${new Date().toISOString()}&_=${Math.random().toString(36).substring(2, 15)}`;
          
          window.location.href = `${baseUrl}?${cacheBuster}`;
        } catch (e) {
          console.error('خطأ في إعادة تحميل الصفحة مع منع التخزين المؤقت:', e);
          
          // محاولة طريقة بديلة
          try {
            const currentUrl = window.location.href.split('?')[0];
            window.location.href = `${currentUrl}?bust=${Date.now()}&r=${Math.random()}`;
          } catch (e2) {
            console.error('خطأ في الطريقة البديلة:', e2);
            
            // طريقة أخيرة بسيطة
            window.location.reload();
          }
        }
      }, 1000);
    }
    
    return true;
  } catch (error) {
    console.error('فشل في النشر القسري:', error);
    
    // محاولة إجبار إعادة التحميل على أي حال في حالة الفشل إذا لم يتم تخطي إعادة التحميل
    if (!skipReload) {
      try {
        window.location.reload();
      } catch (e) {
        console.error('فشل في إعادة تحميل الصفحة:', e);
      }
    }
    
    return false;
  }
};

/**
 * Forces a page refresh with cache prevention
 * @param delay - Time in milliseconds to wait before refreshing
 */
export const forcePageRefresh = (delay = 1000): void => {
  console.log('جاري إعادة تحميل الصفحة مع منع التخزين المؤقت...');
  
  // إنشاء معرف فريد للتحديث
  const updateId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // إضافة علامات متعددة لمنع التخزين المؤقت
  const markers = {
    'force_browser_refresh': 'true',
    'bladi_force_refresh': 'true',
    'data_version': updateId,
    'nocache_version': updateId,
    'refresh_timestamp': updateId,
    'aggressive_cache_bust': 'true',
    'total_cache_clear': 'true',
    'clear_page_cache': 'true'
  };
  
  // تطبيق جميع العلامات فورًا
  Object.entries(markers).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`;
    } catch (e) {
      // تجاهل أي أخطاء
    }
  });
  
  // مسح التخزين المؤقت للصفحة إذا أمكن
  try {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
  } catch (e) {
    console.error('خطأ في مسح التخزين المؤقت للصفحة:', e);
  }
  
  // إعادة تحميل الصفحة بعد التأخير المحدد مع منع التخزين المؤقت
  setTimeout(() => {
    try {
      // إضافة meta tags لمنع التخزين المؤقت
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta);
      
      // إعادة تحميل الصفحة مع معلمات متعددة لمنع التخزين المؤقت
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      const cacheBuster = `refresh=${updateId}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 15)}&v=${Date.now()}&ts=${new Date().toISOString()}&_=${Math.random().toString(36).substring(2, 15)}`;
      
      window.location.href = `${baseUrl}?${cacheBuster}`;
    } catch (e) {
      console.error('خطأ في إعادة تحميل الصفحة مع منع التخزين المؤقت:', e);
      
      // محاولة طريقة بديلة
      try {
        const currentUrl = window.location.href.split('?')[0];
        window.location.href = `${currentUrl}?bust=${Date.now()}&r=${Math.random()}`;
      } catch (e2) {
        console.error('خطأ في الطريقة البديلة:', e2);
        
        // طريقة أخيرة بسيطة
        window.location.reload();
      }
    }
  }, delay);
};

// وظيفة جديدة للتطبيق الفوري للتغييرات وإعادة تحميل الصفحة
// New function for immediate application of changes and page reload
export const applyChangesAndReload = async (): Promise<void> => {
  // 1. حفظ البيانات
  saveChannelsToStorage();
  
  // 2. مسح التخزين المؤقت
  await clearPageCache();
  
  // 3. تطبيق علامات التحديث
  const updateId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  const markers = {
    'force_browser_refresh': 'true',
    'bladi_force_refresh': 'true',
    'data_version': updateId,
    'nocache_version': updateId,
    'refresh_timestamp': updateId,
    'aggressive_cache_bust': 'true',
    'total_cache_clear': 'true',
    'clear_page_cache': 'true',
    'immediate_reload': 'true'
  };
  
  // تطبيق جميع العلامات
  Object.entries(markers).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`;
    } catch (e) {
      // تجاهل أي أخطاء
    }
  });
  
  // 4. إضافة meta tags لمنع التخزين المؤقت
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(meta);
  
  // 5. إعادة تحميل الصفحة
  setTimeout(() => {
    try {
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      const cacheBuster = `refresh=${updateId}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 15)}&v=${Date.now()}&ts=${new Date().toISOString()}&_=${Math.random().toString(36).substring(2, 15)}`;
      
      window.location.href = `${baseUrl}?${cacheBuster}`;
    } catch (e) {
      window.location.reload();
    }
  }, 500);
};
