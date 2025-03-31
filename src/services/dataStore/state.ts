
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
