
import { Channel, Country, Category } from '@/types';
import { STORAGE_KEYS } from './config';
import { fallbackChannels, fallbackCountries, fallbackCategories } from './fallbackData';

// ذاكرة التخزين المؤقت
export let channels: Channel[] = [];
export let countries: Country[] = [];
export let categories: Category[] = [];
export let isSyncing = false;
// تحسين: إضافة تتبع لسجل المشاهدة
export let watchHistory: {channelId: string, timestamp: number}[] = [];

// دالة لتحديث حالة المزامنة
export const setIsSyncing = (value: boolean) => {
  isSyncing = value;
};

// تحسين: إضافة دالة لتحديث سجل المشاهدة
export const addToWatchHistory = (channelId: string) => {
  // التحقق مما إذا كانت القناة موجودة بالفعل في السجل
  const existingIndex = watchHistory.findIndex(item => item.channelId === channelId);
  
  if (existingIndex !== -1) {
    // إذا كانت موجودة، قم بتحديث الطابع الزمني فقط
    watchHistory[existingIndex].timestamp = Date.now();
  } else {
    // إضافة قناة جديدة إلى السجل
    watchHistory.push({
      channelId,
      timestamp: Date.now()
    });
  }
  
  // الاحتفاظ بـ 20 قناة فقط في السجل
  if (watchHistory.length > 20) {
    watchHistory = watchHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }
  
  // حفظ في التخزين المحلي
  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(watchHistory));
};

// تحسين: إضافة دالة للحصول على سجل المشاهدة
export const getWatchHistory = (): {channelId: string, timestamp: number}[] => {
  return [...watchHistory]
    .sort((a, b) => b.timestamp - a.timestamp);
};

// دالة مساعدة لتحميل البيانات من التخزين المحلي أو استخدام البيانات الاحتياطية
export const loadFromLocalStorage = () => {
  try {
    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const storedWatchHistory = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);

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
    
    if (storedWatchHistory) {
      watchHistory = JSON.parse(storedWatchHistory);
    } else {
      watchHistory = [];
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
    watchHistory = [];
  }
};

// تهيئة البيانات
loadFromLocalStorage();
