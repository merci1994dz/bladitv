
import { STORAGE_KEYS } from '../../config';
import { CMSSchedule } from '../types';

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
