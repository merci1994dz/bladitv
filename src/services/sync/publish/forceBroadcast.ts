
/**
 * وظائف البث القسري
 * Force broadcast functions
 */

import { saveChannelsToStorage } from '../../dataStore/storage';

/**
 * إجبار تحديث المتصفحات
 * Force browsers refresh
 */
export const forceBrowsersRefresh = async (): Promise<boolean> => {
  try {
    console.log('إجبار تحديث المتصفحات...');
    
    // تعيين علامات التحديث القسري
    // Set force refresh flags
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('nocache_version', Date.now().toString());
    
    // إطلاق حدث تحديث قسري
    // Dispatch force refresh event
    const event = new CustomEvent('force_refresh', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في إجبار تحديث المتصفحات:', error);
    return false;
  }
};

/**
 * إجبار تحديث جميع المتصفحات
 * Force all browsers to refresh
 */
export const forceBroadcastToAllBrowsers = async (): Promise<boolean> => {
  try {
    console.log('إجبار تحديث جميع المتصفحات...');
    
    // حفظ البيانات في التخزين المحلي
    // Save data to local storage
    saveChannelsToStorage();
    
    // تعيين علامات التحديث القسري
    // Set force refresh flags
    localStorage.setItem('force_all_browsers_refresh', 'true');
    localStorage.setItem('nocache_version', Date.now().toString());
    localStorage.setItem('data_version', Date.now().toString());
    
    // إطلاق حدث تحديث قسري لجميع المتصفحات
    // Dispatch force refresh event for all browsers
    const event = new CustomEvent('force_all_browsers_refresh', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في إجبار تحديث جميع المتصفحات:', error);
    return false;
  }
};
