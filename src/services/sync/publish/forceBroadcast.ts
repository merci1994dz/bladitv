
import { saveChannelsToStorage } from '../../dataStore';
import { syncAllData } from '../coreSync';

// Function for direct and strong broadcasting to all browsers
export const forceBroadcastToAllBrowsers = async (skipReload: boolean = false): Promise<boolean> => {
  console.log('بدء النشر القسري والقوي لجميع المتصفحات...');
  
  try {
    // 1. Save current data
    saveChannelsToStorage();
    
    // 2. Create unique update ID
    const updateId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
    
    // 3. Send multiple diverse signals
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
      { key: 'nocache_version', value: updateId }
    ];
    
    // Apply signals sequentially with short time intervals
    let delay = 0;
    const step = 50; // 50 milliseconds between each signal (decreased for faster response)
    
    for (const signal of signals) {
      setTimeout(() => {
        localStorage.setItem(signal.key, signal.value);
        console.log(`تم إرسال إشارة: ${signal.key} = ${signal.value}`);
      }, delay);
      delay += step;
    }
    
    // 5. Apply forced sync
    setTimeout(async () => {
      await syncAllData(true);
      
      // 6. Send final signal after sync completion
      localStorage.setItem('sync_complete', updateId);
      localStorage.setItem('force_browser_refresh', 'true');
      
      // 7. Force reload of current page with cache busting parameters only if skipReload is false
      if (!skipReload) {
        setTimeout(() => {
          try {
            const baseUrl = window.location.href.split('?')[0];
            const cacheBuster = `refresh=${updateId}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 9)}`;
            window.location.href = `${baseUrl}?${cacheBuster}`;
          } catch (e) {
            // Fallback to simple reload
            window.location.reload();
          }
        }, 1000);
      }
    }, delay + 100);
    
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

// وظيفة جديدة لإعادة تحميل الصفحة الحالية مع منع التخزين المؤقت
// New function to reload current page with cache prevention
export const forcePageRefresh = (delay = 1000): void => {
  console.log('جاري إعادة تحميل الصفحة مع منع التخزين المؤقت...');
  
  // إنشاء معرف فريد للتحديث
  const updateId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
  
  // إضافة علامات متعددة لمنع التخزين المؤقت
  localStorage.setItem('force_browser_refresh', 'true');
  localStorage.setItem('bladi_force_refresh', 'true');
  localStorage.setItem('data_version', updateId);
  localStorage.setItem('nocache_version', updateId);
  localStorage.setItem('refresh_timestamp', updateId);
  
  // إعادة تحميل الصفحة بعد التأخير المحدد
  setTimeout(() => {
    try {
      const baseUrl = window.location.href.split('?')[0];
      const cacheBuster = `refresh=${updateId}&nocache=${Date.now()}&t=${Date.now()}&r=${Math.random().toString(36).substring(2, 9)}`;
      window.location.href = `${baseUrl}?${cacheBuster}`;
    } catch (e) {
      // Fallback to simple reload
      window.location.reload();
    }
  }, delay);
};
