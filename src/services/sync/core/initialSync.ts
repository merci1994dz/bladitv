
/**
 * وظائف التهيئة والمزامنة الأولية
 * Initialization and initial sync functions
 */

import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';
import { syncAllData } from './syncOperations';

/**
 * تنفيذ المزامنة الأولية عند بدء التطبيق
 * Perform initial synchronization on app startup
 * 
 * @param forceInitialSync تجاهل التخزين المؤقت وفرض المزامنة الأولية
 */
export const performInitialSync = async (forceInitialSync = false): Promise<boolean> => {
  console.log('بدء تنفيذ المزامنة الأولية...');
  
  try {
    // التحقق من توفر مصادر البيانات أولاً
    await checkBladiInfoAvailability();
    
    // تنفيذ المزامنة الأولية
    return await syncAllData(forceInitialSync);
  } catch (error) {
    console.error('فشل في تنفيذ المزامنة الأولية:', error);
    return false;
  }
};
