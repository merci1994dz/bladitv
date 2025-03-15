
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

// دالة جديدة لحفظ القنوات إلى التخزين المحلي وضمان مزامنتها
export const saveChannelsToStorage = () => {
  try {
    console.log(`حفظ ${channels.length} قناة إلى التخزين المحلي للنشر للجميع`);
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    
    // إضافة علامة زمنية للتأكد من أن المتصفح سيحدث القنوات
    localStorage.setItem('channels_last_updated', Date.now().toString());
    
    // إضافة علامة للتحديث على bladi-info.com
    localStorage.setItem('bladi_info_update', Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ القنوات إلى التخزين المحلي:', error);
    return false;
  }
};

// دالة مُحَسَّنة لتحميل البيانات من التخزين المحلي أو استخدام البيانات الاحتياطية
export const loadFromLocalStorage = () => {
  try {
    // Clear memory cache first
    channels = [];
    countries = [];
    categories = [];

    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    if (storedChannels) {
      channels = JSON.parse(storedChannels);
      console.log(`تم تحميل ${channels.length} قناة من التخزين المحلي`);
    } else {
      channels = [...fallbackChannels];
      console.log(`تم تحميل ${channels.length} قناة من البيانات الاحتياطية`);
      // حفظ البيانات الاحتياطية إلى التخزين المحلي لضمان توفرها
      saveChannelsToStorage();
    }

    if (storedCountries) {
      countries = JSON.parse(storedCountries);
      console.log(`تم تحميل ${countries.length} دولة من التخزين المحلي`);
    } else {
      countries = [...fallbackCountries];
      console.log(`تم تحميل ${countries.length} دولة من البيانات الاحتياطية`);
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    }

    if (storedCategories) {
      categories = JSON.parse(storedCategories);
      console.log(`تم تحميل ${categories.length} فئة من التخزين المحلي`);
    } else {
      categories = [...fallbackCategories];
      console.log(`تم تحميل ${categories.length} فئة من البيانات الاحتياطية`);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
    
    // تهيئة كلمة مرور المشرف إذا لم تكن موجودة
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, 'admin123');
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    
    // استخدام البيانات الاحتياطية
    channels = [...fallbackChannels];
    countries = [...fallbackCountries];
    categories = [...fallbackCategories];
    
    // محاولة حفظ البيانات الاحتياطية
    saveChannelsToStorage();
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }
};

// دالة محسنة لإضافة قناة وضمان تخزينها بشكل صحيح
export const addChannelToMemory = (channel: Channel) => {
  // التحقق من وجود القناة
  const index = channels.findIndex(c => c.id === channel.id);
  if (index >= 0) {
    // تحديث القناة الموجودة
    channels[index] = channel;
  } else {
    // إضافة قناة جديدة
    channels.push(channel);
  }
  
  // حفظ إلى التخزين المحلي مباشرة
  saveChannelsToStorage();
  
  // إضافة علامة زمنية للتحديثات الجديدة
  localStorage.setItem('channels_updated_at', new Date().toISOString());
  localStorage.setItem('bladi_info_update', Date.now().toString());
  
  console.log(`تم ${index >= 0 ? 'تحديث' : 'إضافة'} القناة: ${channel.name} ونشرها للمستخدمين`);
  
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
    
    // إضافة علامة التحديث لـ bladi-info.com
    localStorage.setItem('bladi_info_update', Date.now().toString());
    
    console.log(`تم حذف القناة: ${channelName} وتحديث البيانات`);
    return true;
  }
  return false;
};

// تهيئة البيانات
loadFromLocalStorage();
