
import { STORAGE_KEYS } from '../config';
import { channels, countries, categories } from './state';
import { fallbackChannels, fallbackCountries, fallbackCategories } from '../fallbackData';

// Function to save channels to local storage
export const saveChannelsToStorage = () => {
  try {
    console.log(`حفظ ${channels.length} قناة إلى التخزين المحلي للنشر للجميع`);
    
    // Save data in JSON format
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    
    // Add multiple timestamps to ensure the browser updates channels
    const timestamp = Date.now().toString();
    localStorage.setItem('channels_last_updated', timestamp);
    localStorage.setItem('last_update_time', timestamp); 
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('nocache_version', timestamp);
    
    // For additional compatibility with all browsers
    try {
      sessionStorage.setItem('channel_update', timestamp);
      document.cookie = `channel_update=${timestamp}; path=/;`;
      
      // Try to broadcast a custom app event
      const event = new CustomEvent('bladi_data_update', { 
        detail: { type: 'channels', time: timestamp } 
      });
      window.dispatchEvent(event);
    } catch (e) {
      // Ignore any errors here
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ القنوات إلى التخزين المحلي:', error);
    return false;
  }
};

// Function to load data from local storage or use fallback data
export const loadFromLocalStorage = () => {
  try {
    console.log('تحميل البيانات من التخزين المحلي...');
    
    // Clear memory cache first
    channels.length = 0;
    countries.length = 0;
    categories.length = 0;

    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    // Load channels
    if (storedChannels) {
      try {
        const parsedChannels = JSON.parse(storedChannels);
        if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
          channels.push(...parsedChannels);
          console.log(`تم تحميل ${channels.length} قناة من التخزين المحلي`);
        } else {
          throw new Error('تنسيق القنوات غير صالح');
        }
      } catch (e) {
        console.error('خطأ في تحليل بيانات القنوات:', e);
        channels.push(...fallbackChannels);
        console.log(`تم تحميل ${channels.length} قناة من البيانات الاحتياطية بسبب خطأ`);
      }
    } else {
      channels.push(...fallbackChannels);
      console.log(`تم تحميل ${channels.length} قناة من البيانات الاحتياطية`);
    }

    // Load countries
    if (storedCountries) {
      try {
        const parsedCountries = JSON.parse(storedCountries);
        if (Array.isArray(parsedCountries) && parsedCountries.length > 0) {
          countries.push(...parsedCountries);
          console.log(`تم تحميل ${countries.length} دولة من التخزين المحلي`);
        } else {
          throw new Error('تنسيق الدول غير صالح');
        }
      } catch (e) {
        console.error('خطأ في تحليل بيانات الدول:', e);
        countries.push(...fallbackCountries);
      }
    } else {
      countries.push(...fallbackCountries);
      console.log(`تم تحميل ${countries.length} دولة من البيانات الاحتياطية`);
    }

    // Load categories
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          categories.push(...parsedCategories);
          console.log(`تم تحميل ${categories.length} فئة من التخزين المحلي`);
        } else {
          throw new Error('تنسيق الفئات غير صالح');
        }
      } catch (e) {
        console.error('خطأ في تحليل بيانات الفئات:', e);
        categories.push(...fallbackCategories);
      }
    } else {
      categories.push(...fallbackCategories);
      console.log(`تم تحميل ${categories.length} فئة من البيانات الاحتياطية`);
    }
    
    // Save loaded data back to ensure it's available
    saveChannelsToStorage();
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Ensure changes are broadcast - optimization
    const timestamp = Date.now().toString();
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('data_version', timestamp);
    
    // Initialize admin password if not exists
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, 'admin123');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ خطير في تحميل البيانات من التخزين المحلي:', error);
    
    // Use fallback data
    channels.length = 0;
    countries.length = 0;
    categories.length = 0;
    
    channels.push(...fallbackChannels);
    countries.push(...fallbackCountries);
    categories.push(...fallbackCategories);
    
    // Try to save fallback data
    try {
      saveChannelsToStorage();
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (saveError) {
      console.error('فشل في حفظ البيانات الاحتياطية:', saveError);
    }
    
    return false;
  }
};
