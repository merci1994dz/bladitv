
import { saveChannelsToStorage } from '../../dataStore';
import { syncAllData } from '../coreSync';
import { addUpdateMarkers } from './updateMarkers';

// Function to publish channels to all users
export const publishChannelsToAllUsers = async (): Promise<boolean> => {
  console.log('نشر القنوات لجميع المستخدمين...');
  
  try {
    // 1. Save channels to local storage
    const saveResult = saveChannelsToStorage();
    if (!saveResult) {
      throw new Error('فشل في حفظ القنوات إلى التخزين المحلي');
    }
    
    // 2. Add update markers to ensure all users see the updated data
    const timestamp = Date.now().toString();
    addUpdateMarkers(timestamp);
    
    // 3. Attempt to use sessionStorage too
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('reload_time', timestamp);
      sessionStorage.setItem('channels_update', timestamp);
      sessionStorage.setItem('require_refresh', 'true');
    } catch (e) {
      // Ignore errors here
    }
    
    // 4. Attempt to use cookies too
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `reload_time=${timestamp}; path=/;`;
      document.cookie = `channels_update=${timestamp}; path=/;`;
    } catch (e) {
      // Ignore errors here
    }
    
    // 5. Dispatch a custom event to notify all app components
    try {
      const event = new CustomEvent('channels_updated', { 
        detail: { timestamp, source: 'cms' } 
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.error('فشل في إطلاق حدث تحديث القنوات:', e);
    }
    
    // 6. Apply forced sync
    const syncResult = await syncAllData(true);
    
    // 7. Add delay before reload to give time for changes to take effect
    if (syncResult) {
      setTimeout(() => {
        localStorage.setItem('refresh_complete', timestamp);
        
        // 8. Announce completion of update
        try {
          const completionEvent = new CustomEvent('update_complete', { 
            detail: { timestamp, success: true } 
          });
          window.dispatchEvent(completionEvent);
        } catch (e) {
          // Ignore errors here
        }
        
        // 9. Reload user's page to ensure changes are visible
        // Add parameter to avoid caching
        try {
          window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
        } catch (e) {
          console.error('فشل في إعادة تحميل الصفحة:', e);
          
          // Try another reload method if the previous one failed
          try {
            window.location.reload();
          } catch (e2) {
            console.error('فشل في تحديث الصفحة بالطريقة الثانية:', e2);
          }
        }
      }, 1800);
    }
    
    console.log('نتيجة النشر للمستخدمين:', { saveResult, syncResult });
    
    return syncResult;
  } catch (error) {
    console.error('فشل في نشر القنوات للمستخدمين:', error);
    return false;
  }
};

// Function to verify updates propagation
export const verifyUpdatesPropagation = async (): Promise<boolean> => {
  try {
    // Add multiple timestamps with different patterns for different browsers
    const timestamp = Date.now().toString();
    
    // Array of functions to execute different publishing methods
    const methods = [
      // LocalStorage - primary method
      () => localStorage.setItem('data_version', timestamp),
      () => localStorage.setItem('bladi_info_update', timestamp),
      () => localStorage.setItem('force_browser_refresh', 'true'),
      () => localStorage.setItem('channels_last_update', timestamp),
      () => localStorage.setItem('bladi_update_version', timestamp),
      
      // SessionStorage - additional method
      () => sessionStorage.setItem('update_notification', timestamp),
      () => sessionStorage.setItem('force_reload', 'true'),
      
      // Cookies - third method
      () => document.cookie = `update_check=${timestamp}; path=/;`,
      () => document.cookie = `force_reload=true; path=/;`,
      
      // Attempt at close intervals to ensure update is received
      () => setTimeout(() => localStorage.setItem('delayed_update', timestamp), 300),
      () => setTimeout(() => localStorage.setItem('force_refresh', 'true'), 600),
      () => setTimeout(() => localStorage.setItem('final_update_check', timestamp), 900),
      () => setTimeout(() => localStorage.setItem('refresh_signal', timestamp), 1200)
    ];
    
    // Execute all publishing methods
    methods.forEach(method => {
      try {
        method();
      } catch (e) {
        // Ignore errors in individual functions
        console.error('فشل في تنفيذ إحدى طرق النشر:', e);
      }
    });
    
    // Perform forced sync
    await syncAllData(true);
    
    // Force reload after sufficient delay
    setTimeout(() => {
      localStorage.setItem('final_check', timestamp);
      
      // Reload with cache prevention
      window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
    }, 1800);
    
    return true;
  } catch (error) {
    console.error('فشل في التحقق من نشر التحديثات:', error);
    return false;
  }
};
