
import { loadFromLocalStorage, saveChannelsToStorage } from '../dataStore';
import { STORAGE_KEYS } from '../config';
import { updateLastSyncTime } from './config';

// الوظيفة الرئيسية للمزامنة مع البيانات المحلية
export const syncWithLocalData = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('مزامنة مع البيانات المحلية، تحديث قسري =', forceRefresh);
    
    // إذا تم طلب تحديث قسري، قم بمسح معلومات المزامنة السابقة
    if (forceRefresh) {
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    }
    
    // تحميل البيانات من التخزين المحلي
    const success = loadFromLocalStorage();
    
    if (success) {
      // تحديث وقت آخر مزامنة
      updateLastSyncTime();
      console.log('تمت المزامنة بنجاح مع البيانات المحلية');
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في المزامنة مع البيانات المحلية:', error);
    return false;
  }
};

// وظيفة التحقق من الحاجة للمزامنة
export const isSyncNeeded = (): boolean => {
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  return !hasChannels || !hasCategories || !hasCountries;
};

// وظيفة الحصول على وقت آخر مزامنة
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// وظيفة لفرض المزامنة
export const forceSync = async (): Promise<boolean> => {
  return syncWithLocalData(true);
};

// وظيفة لإخفاء روابط البث (لأسباب أمنية)
export const obfuscateStreamUrls = (url: string): string => {
  if (!url) return '';
  try {
    // إخفاء جزء من الرابط للحماية
    const parts = url.split('://');
    if (parts.length < 2) return url;
    
    const protocol = parts[0];
    const domain = parts[1].split('/')[0];
    return `${protocol}://${domain}/***`;
  } catch (e) {
    return url;
  }
};
