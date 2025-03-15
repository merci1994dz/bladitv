
import { Channel, Country, Category } from '@/types';
import { STORAGE_KEYS } from './config';
import { fallbackChannels, fallbackCountries, fallbackCategories } from './fallbackData';

// ذاكرة التخزين المؤقت
export let channels: Channel[] = [];
export let countries: Country[] = [];
export let categories: Category[] = [];
export let isSyncing = false;

// دالة لتحديث حالة المزامنة
export const setIsSyncing = (value: boolean) => {
  isSyncing = value;
};

// دالة محسّنة لحفظ القنوات إلى التخزين المحلي وضمان مزامنتها
export const saveChannelsToStorage = () => {
  try {
    console.log(`حفظ ${channels.length} قناة إلى التخزين المحلي للنشر للجميع`);
    
    // حفظ البيانات بتنسيق JSON
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    
    // إضافة علامات زمنية متعددة للتأكد من أن المتصفح سيحدث القنوات
    const timestamp = Date.now().toString();
    localStorage.setItem('channels_last_updated', timestamp);
    localStorage.setItem('last_update_time', timestamp); 
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('nocache_version', timestamp);
    
    // لتوافق إضافي مع جميع المتصفحات
    try {
      sessionStorage.setItem('channel_update', timestamp);
      document.cookie = `channel_update=${timestamp}; path=/;`;
      
      // محاولة نشر حدث مخصص للتطبيق
      const event = new CustomEvent('bladi_data_update', { 
        detail: { type: 'channels', time: timestamp } 
      });
      window.dispatchEvent(event);
    } catch (e) {
      // تجاهل أي أخطاء هنا
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ القنوات إلى التخزين المحلي:', error);
    return false;
  }
};

// دالة مُحسَّنة لتحميل البيانات من التخزين المحلي أو استخدام البيانات الاحتياطية
export const loadFromLocalStorage = () => {
  try {
    console.log('تحميل البيانات من التخزين المحلي...');
    
    // تفريغ ذاكرة التخزين المؤقت أولاً
    channels = [];
    countries = [];
    categories = [];

    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    // تحميل القنوات
    if (storedChannels) {
      try {
        const parsedChannels = JSON.parse(storedChannels);
        if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
          channels = parsedChannels;
          console.log(`تم تحميل ${channels.length} قناة من التخزين المحلي`);
        } else {
          throw new Error('تنسيق القنوات غير صالح');
        }
      } catch (e) {
        console.error('خطأ في تحليل بيانات القنوات:', e);
        channels = [...fallbackChannels];
        console.log(`تم تحميل ${channels.length} قناة من البيانات الاحتياطية بسبب خطأ`);
      }
    } else {
      channels = [...fallbackChannels];
      console.log(`تم تحميل ${channels.length} قناة من البيانات الاحتياطية`);
    }

    // تحميل الدول
    if (storedCountries) {
      try {
        const parsedCountries = JSON.parse(storedCountries);
        if (Array.isArray(parsedCountries) && parsedCountries.length > 0) {
          countries = parsedCountries;
          console.log(`تم تحميل ${countries.length} دولة من التخزين المحلي`);
        } else {
          throw new Error('تنسيق الدول غير صالح');
        }
      } catch (e) {
        console.error('خطأ في تحليل بيانات الدول:', e);
        countries = [...fallbackCountries];
      }
    } else {
      countries = [...fallbackCountries];
      console.log(`تم تحميل ${countries.length} دولة من البيانات الاحتياطية`);
    }

    // تحميل التصنيفات
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          categories = parsedCategories;
          console.log(`تم تحميل ${categories.length} فئة من التخزين المحلي`);
        } else {
          throw new Error('تنسيق الفئات غير صالح');
        }
      } catch (e) {
        console.error('خطأ في تحليل بيانات الفئات:', e);
        categories = [...fallbackCategories];
      }
    } else {
      categories = [...fallbackCategories];
      console.log(`تم تحميل ${categories.length} فئة من البيانات الاحتياطية`);
    }
    
    // حفظ البيانات المحملة مرة أخرى لضمان توفرها
    saveChannelsToStorage();
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // ضمان نشر التغييرات - تحسين
    const timestamp = Date.now().toString();
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('data_version', timestamp);
    
    // تهيئة كلمة مرور المشرف إذا لم تكن موجودة
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, 'admin123');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ خطير في تحميل البيانات من التخزين المحلي:', error);
    
    // استخدام البيانات الاحتياطية
    channels = [...fallbackChannels];
    countries = [...fallbackCountries];
    categories = [...fallbackCategories];
    
    // محاولة حفظ البيانات الاحتياطية
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

// دالة محسنة لإضافة قناة وضمان تخزينها ونشرها
export const addChannelToMemory = (channel: Channel) => {
  // التحقق من وجود القناة
  const index = channels.findIndex(c => c.id === channel.id);
  
  if (index >= 0) {
    // تحديث القناة الموجودة
    channels[index] = { ...channel };
    console.log(`تم تحديث القناة: ${channel.name}`);
  } else {
    // إضافة قناة جديدة
    channels.push({ ...channel });
    console.log(`تم إضافة القناة: ${channel.name}`);
  }
  
  // حفظ إلى التخزين المحلي مباشرة وإضافة علامات تحديث
  saveChannelsToStorage();
  
  // إضافة علامات تحديث إضافية - تحسين
  const timestamp = Date.now().toString();
  localStorage.setItem('channels_updated_at', new Date().toISOString());
  localStorage.setItem('bladi_info_update', timestamp);
  localStorage.setItem('force_refresh', 'true');
  localStorage.setItem('force_browser_refresh', 'true');
  localStorage.setItem('app_update_required', timestamp);
  
  return channel;
};

// دالة محسنة لحذف قناة
export const removeChannelFromMemory = (channelId: string) => {
  const index = channels.findIndex(c => c.id === channelId);
  if (index >= 0) {
    const channelName = channels[index].name;
    channels.splice(index, 1);
    
    // حفظ التغييرات مباشرة
    saveChannelsToStorage();
    
    // إضافة علامات تحديث - تحسين
    const timestamp = Date.now().toString();
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('app_update_required', timestamp);
    
    console.log(`تم حذف القناة: ${channelName} وتحديث البيانات`);
    return true;
  }
  return false;
};

// تحديث بيانات قناة وضمان نشرها - محسّن
export const updateChannelInMemory = (channel: Channel) => {
  const index = channels.findIndex(c => c.id === channel.id);
  if (index >= 0) {
    channels[index] = { ...channel };
    
    // حفظ التغييرات ونشرها
    saveChannelsToStorage();
    
    // إضافة علامات تحديث - تحسين
    const timestamp = Date.now().toString();
    localStorage.setItem('channel_updated', timestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('app_update_required', timestamp);
    localStorage.setItem('data_version', timestamp);
    
    // نشر حدث تم تحديث البيانات
    try {
      const event = new CustomEvent('channel_updated', { 
        detail: { channelId: channel.id, time: timestamp }
      });
      window.dispatchEvent(event);
    } catch (e) {
      // تجاهل أي أخطاء هنا
    }
    
    console.log(`تم تحديث القناة: ${channel.name} ونشرها`);
    return true;
  }
  return false;
};

// تهيئة البيانات
loadFromLocalStorage();
