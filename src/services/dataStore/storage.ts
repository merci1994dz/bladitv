
/**
 * وظائف تخزين البيانات
 * Data storage functions
 */

import { channels, countries, categories } from './state';

// مفاتيح التخزين المحلي
// Local storage keys
const STORAGE_KEYS = {
  CHANNELS: 'channels',
  COUNTRIES: 'countries',
  CATEGORIES: 'categories'
};

/**
 * حفظ القنوات في التخزين المحلي
 * Save channels to local storage
 */
export const saveChannelsToStorage = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // إطلاق حدث تحديث البيانات
    // Dispatch data update event
    const event = new CustomEvent('data_stored', { 
      detail: { timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
  }
};

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
