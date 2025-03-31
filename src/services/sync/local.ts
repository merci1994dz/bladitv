
/**
 * وظائف المزامنة المحلية
 * Local sync functions
 */

import { loadFromLocalStorage, saveChannelsToStorage } from '../dataStore/storage';
import { updateLastSyncTime } from './config';

/**
 * تحميل البيانات من التخزين المحلي
 * Load data from local storage
 */
export const loadLocalData = async (): Promise<boolean> => {
  try {
    const loaded = loadFromLocalStorage();
    
    if (loaded) {
      console.log('تم تحميل البيانات من التخزين المحلي بنجاح');
      return true;
    }
    
    console.warn('لم يتم العثور على بيانات محلية');
    return false;
  } catch (error) {
    console.error('خطأ في تحميل البيانات المحلية:', error);
    return false;
  }
};

/**
 * حفظ البيانات في التخزين المحلي
 * Save data to local storage
 */
export const saveLocalData = async (): Promise<boolean> => {
  try {
    const saved = await saveChannelsToStorage();
    
    if (saved) {
      console.log('تم حفظ البيانات في التخزين المحلي بنجاح');
      updateLastSyncTime();
      return true;
    }
    
    console.error('فشل حفظ البيانات في التخزين المحلي');
    return false;
  } catch (error) {
    console.error('خطأ في حفظ البيانات المحلية:', error);
    return false;
  }
};

/**
 * حذف جميع البيانات المحلية
 * Clear all local data
 */
export const clearLocalData = (): boolean => {
  try {
    localStorage.removeItem('channels');
    localStorage.removeItem('countries');
    localStorage.removeItem('categories');
    localStorage.removeItem('last_sync_time');
    
    console.log('تم حذف جميع البيانات المحلية');
    return true;
  } catch (error) {
    console.error('خطأ في حذف البيانات المحلية:', error);
    return false;
  }
};
