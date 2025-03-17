
import { STORAGE_KEYS } from '../../config';
import { CMSLayout } from '../types';
import { defaultHomeLayout } from '../defaultData';

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
