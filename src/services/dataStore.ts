
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

// Improved function to load data from localStorage or use fallback data
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
    }

    if (storedCountries) {
      countries = JSON.parse(storedCountries);
      console.log(`تم تحميل ${countries.length} دولة من التخزين المحلي`);
    } else {
      countries = [...fallbackCountries];
      console.log(`تم تحميل ${countries.length} دولة من البيانات الاحتياطية`);
    }

    if (storedCategories) {
      categories = JSON.parse(storedCategories);
      console.log(`تم تحميل ${categories.length} فئة من التخزين المحلي`);
    } else {
      categories = [...fallbackCategories];
      console.log(`تم تحميل ${categories.length} فئة من البيانات الاحتياطية`);
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
  }
};

// Add function to add a channel and ensure it's properly stored
export const addChannelToMemory = (channel: Channel) => {
  // Check if channel already exists
  const index = channels.findIndex(c => c.id === channel.id);
  if (index >= 0) {
    // Update existing channel
    channels[index] = channel;
  } else {
    // Add new channel
    channels.push(channel);
  }
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  return channel;
};

// Add function to remove a channel
export const removeChannelFromMemory = (channelId: string) => {
  const index = channels.findIndex(c => c.id === channelId);
  if (index >= 0) {
    channels.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    return true;
  }
  return false;
};

// تهيئة البيانات
loadFromLocalStorage();
