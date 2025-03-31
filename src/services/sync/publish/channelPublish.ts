
/**
 * وظائف نشر تحديثات القنوات للمستخدمين
 * Functions for publishing channel updates to users
 */

import { saveChannelsToStorage } from '../../dataStore/storage';
import { forceBrowsersRefresh } from './forceBroadcast';

/**
 * نشر تحديثات القنوات لجميع المستخدمين
 * Publish channel updates to all users
 */
export const publishChannelsToAllUsers = async (): Promise<boolean> => {
  try {
    // أولاً، تأكد من حفظ البيانات المحدثة محلياً
    // First, ensure updated data is saved locally
    await saveChannelsToStorage();
    
    // ثم، إجبار المتصفحات الأخرى على التحديث
    // Then, force other browsers to refresh
    await forceBrowsersRefresh();
    
    console.log('تم نشر تحديثات القنوات لجميع المستخدمين بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في نشر تحديثات القنوات:', error);
    return false;
  }
};
