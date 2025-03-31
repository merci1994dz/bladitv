
/**
 * المزامنة مع البيانات المحلية
 * Syncing with local data
 */

import { channels, countries, categories } from '../dataStore/state';
import { STORAGE_KEYS } from './config';

/**
 * تحميل البيانات من التخزين المحلي
 * Load data from local storage
 */
export const loadFromLocalStorage = (): void => {
  try {
    // تحميل القنوات
    // Load channels
    const channelsData = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (channelsData) {
      const parsedChannels = JSON.parse(channelsData);
      channels.length = 0;
      channels.push(...parsedChannels);
    }
    
    // تحميل البلدان
    // Load countries
    const countriesData = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    if (countriesData) {
      const parsedCountries = JSON.parse(countriesData);
      countries.length = 0;
      countries.push(...parsedCountries);
    }
    
    // تحميل الفئات
    // Load categories
    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (categoriesData) {
      const parsedCategories = JSON.parse(categoriesData);
      categories.length = 0;
      categories.push(...parsedCategories);
    }
  } catch (error) {
    console.error('خطأ في تحميل البيانات من التخزين المحلي:', error);
  }
};

/**
 * حفظ البيانات إلى التخزين المحلي
 * Save data to local storage
 */
export const saveChannelsToStorage = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('خطأ في حفظ البيانات إلى التخزين المحلي:', error);
  }
};

/**
 * مزامنة البيانات من التخزين المحلي
 * Sync data from local storage
 */
export const syncWithLocalData = async (): Promise<boolean> => {
  try {
    loadFromLocalStorage();
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة البيانات من التخزين المحلي:', error);
    return false;
  }
};

/**
 * الحصول على وقت آخر مزامنة
 * Get last sync time
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  } catch (error) {
    console.error('خطأ في الحصول على وقت آخر مزامنة:', error);
    return null;
  }
};
