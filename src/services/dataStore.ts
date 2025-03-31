
/**
 * تخزين البيانات المحلية للتطبيق
 * Local data store for the application
 */

import { Channel, Country, Category } from '@/types';

// حالة المزامنة
// Sync state
let isSyncing = false;

// بيانات التطبيق المحلية
// Local application data
export const channels: Channel[] = [];
export const countries: Country[] = [];
export const categories: Category[] = [];

// تعيين حالة المزامنة
// Set sync state
export const setIsSyncing = (syncing: boolean) => {
  isSyncing = syncing;
};

// الحصول على حالة المزامنة
// Get sync state
export const getIsSyncing = (): boolean => {
  return isSyncing;
};

// إضافة قناة إلى التخزين المحلي
// Add channel to local storage
export const addChannel = (channel: Channel) => {
  const existingIndex = channels.findIndex(c => c.id === channel.id);
  
  if (existingIndex >= 0) {
    // تحديث القناة الموجودة
    // Update existing channel
    channels[existingIndex] = {
      ...channels[existingIndex],
      ...channel
    };
  } else {
    // إضافة قناة جديدة
    // Add new channel
    channels.push(channel);
  }
};

// إضافة بلد إلى التخزين المحلي
// Add country to local storage
export const addCountry = (country: Country) => {
  const existingIndex = countries.findIndex(c => c.id === country.id);
  
  if (existingIndex >= 0) {
    // تحديث البلد الموجود
    // Update existing country
    countries[existingIndex] = {
      ...countries[existingIndex],
      ...country
    };
  } else {
    // إضافة بلد جديد
    // Add new country
    countries.push(country);
  }
};

// إضافة فئة إلى التخزين المحلي
// Add category to local storage
export const addCategory = (category: Category) => {
  const existingIndex = categories.findIndex(c => c.id === category.id);
  
  if (existingIndex >= 0) {
    // تحديث الفئة الموجودة
    // Update existing category
    categories[existingIndex] = {
      ...categories[existingIndex],
      ...category
    };
  } else {
    // إضافة فئة جديدة
    // Add new category
    categories.push(category);
  }
};

// مسح جميع البيانات المحلية
// Clear all local data
export const clearAllData = () => {
  channels.length = 0;
  countries.length = 0;
  categories.length = 0;
};
