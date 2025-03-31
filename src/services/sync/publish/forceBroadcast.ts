
/**
 * وظائف إجبار المتصفحات الأخرى على التحديث
 * Functions for forcing other browsers to refresh
 */

import { saveChannelsToStorage } from '../../dataStore/storage';

/**
 * إجبار جميع المتصفحات على التحديث
 * Force all browsers to refresh
 */
export const forceBrowsersRefresh = async (): Promise<boolean> => {
  try {
    // وضع علامة في التخزين المحلي تشير إلى الحاجة للتحديث
    // Set a flag in localStorage indicating the need for refresh
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('force_refresh_timestamp', Date.now().toString());
    
    // إطلاق حدث تحديث إجباري
    // Dispatch a force refresh event
    const event = new CustomEvent('force_data_refresh', {
      detail: {
        source: 'broadcast',
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
    
    console.log('تم إطلاق أمر تحديث إجباري لجميع المتصفحات');
    return true;
  } catch (error) {
    console.error('خطأ في إجبار المتصفحات على التحديث:', error);
    return false;
  }
};
