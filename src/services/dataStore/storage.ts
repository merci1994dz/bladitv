
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
    localStorage.setItem('channels_update_by_cms', timestamp);
    
    // For additional compatibility with all browsers
    try {
      sessionStorage.setItem('channel_update', timestamp);
      document.cookie = `channel_update=${timestamp}; path=/;`;
      
      // Try to broadcast a custom app event
      const event = new CustomEvent('bladi_data_update', { 
        detail: { type: 'channels', time: timestamp } 
      });
      window.dispatchEvent(event);
      
      // Also try to broadcast a storage event manually
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: STORAGE_KEYS.CHANNELS,
          newValue: JSON.stringify(channels),
          storageArea: localStorage
        }));
      } catch (e) {
        // Ignore any errors here
      }
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

    // إنشاء مجموعات لمنع التكرار
    const channelIds = new Set<string>();
    const channelNames = new Set<string>();
    const channelUrls = new Set<string>();
    
    const countryIds = new Set<string>();
    const countryNames = new Set<string>();
    
    const categoryIds = new Set<string>();
    const categoryNames = new Set<string>();

    // Load channels
    if (storedChannels) {
      try {
        const parsedChannels = JSON.parse(storedChannels);
        if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
          // تصفية القنوات المكررة قبل إضافتها
          for (const channel of parsedChannels) {
            const channelId = channel.id;
            const channelName = channel.name.toLowerCase();
            const channelUrl = channel.streamUrl;
            
            // إضافة القناة فقط إذا لم تكن مكررة
            if (!channelIds.has(channelId) && !channelNames.has(channelName) && !channelUrls.has(channelUrl)) {
              channels.push(channel);
              channelIds.add(channelId);
              channelNames.add(channelName);
              channelUrls.add(channelUrl);
            }
          }
          
          console.log(`تم تحميل ${channels.length} قناة من التخزين المحلي (تم تجاهل ${parsedChannels.length - channels.length} قناة مكررة)`);
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
          // تصفية البلدان المكررة قبل إضافتها
          for (const country of parsedCountries) {
            const countryId = country.id;
            const countryName = country.name.toLowerCase();
            
            // إضافة البلد فقط إذا لم يكن مكرراً
            if (!countryIds.has(countryId) && !countryNames.has(countryName)) {
              countries.push(country);
              countryIds.add(countryId);
              countryNames.add(countryName);
            }
          }
          
          console.log(`تم تحميل ${countries.length} دولة من التخزين المحلي (تم تجاهل ${parsedCountries.length - countries.length} دولة مكررة)`);
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
          // تصفية الفئات المكررة قبل إضافتها
          for (const category of parsedCategories) {
            const categoryId = category.id;
            const categoryName = category.name.toLowerCase();
            
            // إضافة الفئة فقط إذا لم تكن مكررة
            if (!categoryIds.has(categoryId) && !categoryNames.has(categoryName)) {
              categories.push(category);
              categoryIds.add(categoryId);
              categoryNames.add(categoryName);
            }
          }
          
          console.log(`تم تحميل ${categories.length} فئة من التخزين المحلي (تم تجاهل ${parsedCategories.length - categories.length} فئة مكررة)`);
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
    
    // Save loaded data back to ensure it's available and force browser refresh
    saveChannelsToStorage();
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Ensure changes are broadcast - with force refresh
    const timestamp = Date.now().toString();
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('data_version', timestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('nocache_version', timestamp);
    
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
