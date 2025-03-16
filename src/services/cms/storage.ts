
import { STORAGE_KEYS } from '../config';
import { 
  CMSUser, 
  CMSContentBlock, 
  CMSLayout, 
  CMSSchedule, 
  CMSSettings 
} from './types';

// الإعدادات الافتراضية للCMS
const defaultSettings: CMSSettings = {
  siteName: 'قنوات بلادي',
  logo: '/assets/logo.png',
  defaultLayout: 'default',
  theme: 'auto',
  featuredChannelsLimit: 10,
  recentlyWatchedLimit: 6,
  showCategoriesOnHome: true,
  showCountriesOnHome: true,
  analyticEnabled: false,
  language: 'ar'
};

// مستخدم افتراضي للCMS (المسؤول)
const defaultAdminUser: CMSUser = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  permissions: ['create', 'read', 'update', 'delete', 'publish'],
  active: true
};

// تخطيط افتراضي للصفحة الرئيسية
const defaultHomeLayout: CMSLayout = {
  id: 'home-default',
  name: 'تخطيط الصفحة الرئيسية',
  type: 'home',
  blocks: ['featured-channels', 'categories-list', 'countries-grid'],
  active: true,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// كتل المحتوى الافتراضية
const defaultContentBlocks: CMSContentBlock[] = [
  {
    id: 'featured-channels',
    title: 'القنوات المميزة',
    type: 'featured',
    content: { channelIds: [] },
    position: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleOn: ['home'],
    settings: {
      maxItems: 6,
      layout: 'carousel'
    }
  },
  {
    id: 'categories-list',
    title: 'الفئات',
    type: 'grid',
    content: { categoryIds: [] },
    position: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleOn: ['home'],
    settings: {
      maxItems: 10,
      layout: 'grid'
    }
  },
  {
    id: 'countries-grid',
    title: 'البلدان',
    type: 'grid',
    content: { countryIds: [] },
    position: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleOn: ['home'],
    settings: {
      maxItems: 12,
      layout: 'grid'
    }
  }
];

// حفظ الإعدادات في التخزين المحلي
export const saveCMSSettings = (settings: CMSSettings): void => {
  localStorage.setItem(STORAGE_KEYS.CMS_SETTINGS, JSON.stringify(settings));
};

// استرداد الإعدادات من التخزين المحلي
export const getCMSSettings = (): CMSSettings => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.CMS_SETTINGS);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    // إذا لم تكن الإعدادات موجودة، قم بتهيئتها
    saveCMSSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('خطأ في استرداد إعدادات CMS:', error);
    return defaultSettings;
  }
};

// حفظ المستخدمين في التخزين المحلي
export const saveCMSUsers = (users: CMSUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.CMS_USERS, JSON.stringify(users));
};

// استرداد المستخدمين من التخزين المحلي
export const getCMSUsers = (): CMSUser[] => {
  try {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.CMS_USERS);
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
    // إذا لم يكن المستخدمون موجودين، قم بتهيئتهم
    saveCMSUsers([defaultAdminUser]);
    return [defaultAdminUser];
  } catch (error) {
    console.error('خطأ في استرداد مستخدمي CMS:', error);
    return [defaultAdminUser];
  }
};

// حفظ تخطيطات الصفحات في التخزين المحلي
export const saveCMSLayouts = (layouts: CMSLayout[]): void => {
  localStorage.setItem(STORAGE_KEYS.CMS_LAYOUTS, JSON.stringify(layouts));
};

// استرداد تخطيطات الصفحات من التخزين المحلي
export const getCMSLayouts = (): CMSLayout[] => {
  try {
    const savedLayouts = localStorage.getItem(STORAGE_KEYS.CMS_LAYOUTS);
    if (savedLayouts) {
      return JSON.parse(savedLayouts);
    }
    // إذا لم تكن التخطيطات موجودة، قم بتهيئتها
    saveCMSLayouts([defaultHomeLayout]);
    return [defaultHomeLayout];
  } catch (error) {
    console.error('خطأ في استرداد تخطيطات CMS:', error);
    return [defaultHomeLayout];
  }
};

// حفظ كتل المحتوى في التخزين المحلي
export const saveCMSContentBlocks = (blocks: CMSContentBlock[]): void => {
  localStorage.setItem(STORAGE_KEYS.CMS_CONTENT_BLOCKS, JSON.stringify(blocks));
};

// استرداد كتل المحتوى من التخزين المحلي
export const getCMSContentBlocks = (): CMSContentBlock[] => {
  try {
    const savedBlocks = localStorage.getItem(STORAGE_KEYS.CMS_CONTENT_BLOCKS);
    if (savedBlocks) {
      return JSON.parse(savedBlocks);
    }
    // إذا لم تكن كتل المحتوى موجودة، قم بتهيئتها
    saveCMSContentBlocks(defaultContentBlocks);
    return defaultContentBlocks;
  } catch (error) {
    console.error('خطأ في استرداد كتل محتوى CMS:', error);
    return defaultContentBlocks;
  }
};

// حفظ جداول العرض في التخزين المحلي
export const saveCMSSchedules = (schedules: CMSSchedule[]): void => {
  localStorage.setItem(STORAGE_KEYS.CMS_SCHEDULES, JSON.stringify(schedules));
};

// استرداد جداول العرض من التخزين المحلي
export const getCMSSchedules = (): CMSSchedule[] => {
  try {
    const savedSchedules = localStorage.getItem(STORAGE_KEYS.CMS_SCHEDULES);
    if (savedSchedules) {
      return JSON.parse(savedSchedules);
    }
    // إذا لم تكن الجداول موجودة، أعد مصفوفة فارغة
    return [];
  } catch (error) {
    console.error('خطأ في استرداد جداول عرض CMS:', error);
    return [];
  }
};

// تهيئة جميع بيانات CMS إذا لم تكن موجودة
export const initializeCMSData = (): void => {
  getCMSSettings();
  getCMSUsers();
  getCMSLayouts();
  getCMSContentBlocks();
  getCMSSchedules();
};
