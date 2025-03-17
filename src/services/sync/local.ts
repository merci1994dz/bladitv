
import { loadFromLocalStorage, saveChannelsToStorage } from '../dataStore';
import { STORAGE_KEYS } from '../config';
import { updateLastSyncTime } from './config';

/**
 * الوظيفة الرئيسية للمزامنة مع البيانات المحلية
 * Main function for synchronizing with local data
 */
export const syncWithLocalData = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('مزامنة مع البيانات المحلية، تحديث قسري = / Syncing with local data, force refresh =', forceRefresh);
    
    // إذا تم طلب تحديث قسري، قم بمسح معلومات المزامنة السابقة
    // If force refresh requested, clear previous sync information
    if (forceRefresh) {
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    }
    
    // تحميل البيانات من التخزين المحلي
    // Load data from local storage
    const success = loadFromLocalStorage();
    
    if (success) {
      // تحديث وقت آخر مزامنة
      // Update last sync time
      updateLastSyncTime();
      console.log('تمت المزامنة بنجاح مع البيانات المحلية / Successfully synced with local data');
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في المزامنة مع البيانات المحلية: / Error syncing with local data:', error);
    return false;
  }
};

/**
 * وظيفة التحقق من الحاجة للمزامنة
 * Function to check if sync is needed
 */
export const isSyncNeeded = (): boolean => {
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  return !hasChannels || !hasCategories || !hasCountries;
};

/**
 * وظيفة الحصول على وقت آخر مزامنة
 * Function to get last sync time
 */
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

/**
 * وظيفة لفرض المزامنة
 * Function to force sync
 */
export const forceSync = async (): Promise<boolean> => {
  return syncWithLocalData(true);
};

/**
 * وظيفة لإخفاء روابط البث (لأسباب أمنية)
 * Function to obfuscate stream URLs (for security reasons)
 */
export const obfuscateStreamUrls = (url: string): string => {
  if (!url) return '';
  try {
    // إخفاء جزء من الرابط للحماية
    // Hide part of the URL for protection
    const parts = url.split('://');
    if (parts.length < 2) return url;
    
    const protocol = parts[0];
    const domain = parts[1].split('/')[0];
    return `${protocol}://${domain}/***`;
  } catch (e) {
    return url;
  }
};
