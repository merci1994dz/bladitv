
/**
 * تهيئة عملية المزامنة
 * Initialize the synchronization process
 */

import { performInitialSync } from '../initialSync';
import { syncState } from '../syncState';

/**
 * تهيئة عملية المزامنة وضبط المتغيرات اللازمة
 * Initialize the sync process and set up necessary variables
 */
export const initializeSyncProcess = async (options: {
  forceSync?: boolean;
  maxRetries?: number;
  timeout?: number;
} = {}): Promise<boolean> => {
  const {
    forceSync = false,
    maxRetries = 3,
    timeout = 20000
  } = options;
  
  console.log('تهيئة عملية المزامنة مع الخيارات:', { forceSync, maxRetries, timeout });
  
  // إعادة تعيين حالة المزامنة
  syncState.consecutiveSyncAttempts = 0;
  syncState.totalSyncAttempts = 0;
  syncState.failedAttempts = 0;
  
  try {
    // تنفيذ المزامنة الأولية
    const success = await performInitialSync(forceSync);
    
    if (success) {
      console.log('تمت تهيئة المزامنة بنجاح');
    } else {
      console.warn('فشلت تهيئة المزامنة الأولية');
    }
    
    return success;
  } catch (error) {
    console.error('خطأ أثناء تهيئة عملية المزامنة:', error);
    return false;
  }
};
