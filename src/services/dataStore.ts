
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

// دالة مساعدة لتحميل البيانات من التخزين المحلي أو استخدام البيانات الاحتياطية
export const loadFromLocalStorage = () => {
  try {
    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    if (storedChannels) {
      channels = JSON.parse(storedChannels);
    } else {
      channels = [...fallbackChannels];
    }

    if (storedCountries) {
      countries = JSON.parse(storedCountries);
    } else {
      countries = [...fallbackCountries];
    }

    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    } else {
      categories = [...fallbackCategories];
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

// تهيئة البيانات
loadFromLocalStorage();
