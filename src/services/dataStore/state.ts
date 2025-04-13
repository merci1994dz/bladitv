
/**
 * حالة مخزن البيانات المحلية
 * Local data store state
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

// تصدير متغير isSyncing للتوافق الخلفي
// Export isSyncing variable for backward compatibility
export { isSyncing };

// إضافة دوال لتعيين القنوات والدول والفئات
// Add functions to set channels, countries, and categories
export const setChannels = (newChannels: Channel[]) => {
  channels.length = 0;
  channels.push(...newChannels);
};

export const setCountries = (newCountries: Country[]) => {
  countries.length = 0;
  countries.push(...newCountries);
};

export const setCategories = (newCategories: Category[]) => {
  categories.length = 0;
  categories.push(...newCategories);
};
