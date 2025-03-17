
import { STORAGE_KEYS } from '../../config';

// تصدير جميع الوظائف من الملفات الفرعية
export { getCMSSettings, saveCMSSettings } from './settings';
export { getCMSUsers, saveCMSUsers } from './users';
export { getCMSLayouts, saveCMSLayouts } from './layouts';
export { getCMSContentBlocks, saveCMSContentBlocks } from './contentBlocks';
export { getCMSSchedules, saveCMSSchedules } from './schedules';

// تهيئة جميع بيانات CMS إذا لم تكن موجودة
export const initializeCMSData = (): void => {
  // استدعاء جميع الوظائف للتأكد من تهيئة البيانات
  const { getCMSSettings } = require('./settings');
  const { getCMSUsers } = require('./users');
  const { getCMSLayouts } = require('./layouts');
  const { getCMSContentBlocks } = require('./contentBlocks');
  const { getCMSSchedules } = require('./schedules');
  
  getCMSSettings();
  getCMSUsers();
  getCMSLayouts();
  getCMSContentBlocks();
  getCMSSchedules();
};
