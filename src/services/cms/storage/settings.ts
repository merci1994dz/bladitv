
import { STORAGE_KEYS } from '../../config';
import { CMSSettings } from '../types';
import { defaultSettings } from '../defaultData';

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
