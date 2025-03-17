
import { STORAGE_KEYS } from '../../config';
import { CMSContentBlock } from '../types';
import { defaultContentBlocks } from '../defaultData';

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
