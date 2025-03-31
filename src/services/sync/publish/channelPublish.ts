
/**
 * وظائف نشر القنوات
 * Channel publishing functions
 */

import { saveChannelsToStorage } from '../../dataStore/storage';

/**
 * نشر القنوات لجميع المستخدمين
 * Publish channels to all users
 */
export const publishChannelsToAllUsers = async (): Promise<boolean> => {
  try {
    console.log('نشر القنوات لجميع المستخدمين...');
    
    // حفظ البيانات في التخزين المحلي
    // Save data to local storage
    saveChannelsToStorage();
    
    // إطلاق حدث تحديث البيانات
    // Dispatch data update event
    const event = new CustomEvent('app_data_updated', {
      detail: { source: 'publish', timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في نشر القنوات للمستخدمين:', error);
    return false;
  }
};
