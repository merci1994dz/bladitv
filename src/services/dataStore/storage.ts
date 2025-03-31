
import { STORAGE_KEYS } from '../sync/config';
import { channels, countries, categories } from './state';
import { Channel, Country, Category } from '@/types';

/**
 * Save channels to local storage
 */
export const saveChannelsToStorage = async (): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    console.log(`تم حفظ ${channels.length} قناة في التخزين المحلي`);
    
    // Dispatch event to notify other components
    const event = new CustomEvent('app_data_updated', { 
      detail: { source: 'local_storage', type: 'channels', timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ القنوات في التخزين المحلي:', error);
    return false;
  }
};

/**
 * Load data from local storage
 */
export const loadFromLocalStorage = (): boolean => {
  try {
    // Load channels
    const channelsJson = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (channelsJson) {
      const parsedChannels: Channel[] = JSON.parse(channelsJson);
      channels.length = 0; // Clear existing channels
      channels.push(...parsedChannels);
      console.log(`تم تحميل ${channels.length} قناة من التخزين المحلي`);
    }
    
    // Load countries
    const countriesJson = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    if (countriesJson) {
      const parsedCountries: Country[] = JSON.parse(countriesJson);
      countries.length = 0; // Clear existing countries
      countries.push(...parsedCountries);
      console.log(`تم تحميل ${countries.length} دولة من التخزين المحلي`);
    }
    
    // Load categories
    const categoriesJson = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (categoriesJson) {
      const parsedCategories: Category[] = JSON.parse(categoriesJson);
      categories.length = 0; // Clear existing categories
      categories.push(...parsedCategories);
      console.log(`تم تحميل ${categories.length} فئة من التخزين المحلي`);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في تحميل البيانات من التخزين المحلي:', error);
    return false;
  }
};
