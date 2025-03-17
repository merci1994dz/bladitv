
// تصدير جميع وظائف إدارة المستخدمين
export * from './userManager';

// تصدير جميع وظائف إدارة كتل المحتوى
export * from './contentBlockManager';

// تصدير جميع وظائف إدارة التخطيطات
export * from './layoutManager';

// تصدير جميع وظائف إدارة جداول العرض
export * from './scheduleManager';

// تصدير جميع وظائف إدارة الإعدادات
export * from './settingsManager';

// تصدير جميع وظائف إدارة القنوات
export * from './channelManager';

// تهيئة نظام CMS
import { getCMSSettings } from '../storage/settings';

export const initializeCMS = (): void => {
  const settings = getCMSSettings();
  console.log('تم تهيئة نظام إدارة المحتوى (CMS)', settings);
  
  // إضافة مؤشر لتهيئة CMS
  localStorage.setItem('cms_initialized', 'true');
  localStorage.setItem('cms_version', '1.0.0');
};
