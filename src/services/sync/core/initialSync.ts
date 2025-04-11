
/**
 * المزامنة الأولية والتحميل
 * Initial synchronization and loading
 */

import { syncWithSupabase } from '../supabaseSync';
import { syncState } from './syncState';

/**
 * تنفيذ المزامنة الأولية
 * Perform initial synchronization
 * 
 * @param forceRefresh تجاهل التخزين المؤقت وفرض التحديث
 * @returns وعد بنتيجة المزامنة
 */
export const performInitialSync = async (forceRefresh = false): Promise<boolean> => {
  syncState.totalSyncAttempts++;
  syncState.consecutiveSyncAttempts++;
  
  try {
    console.log('بدء المزامنة الأولية، الوضع الإجباري =', forceRefresh);
    
    // إعادة تعيين عداد المحاولات إذا كان هذا تحديث قسري
    if (forceRefresh) {
      syncState.consecutiveSyncAttempts = 1;
    }
    
    // تنفيذ المزامنة
    const result = await syncWithSupabase(forceRefresh);
    
    // تحديث حالة المزامنة بناءً على النتيجة
    if (result) {
      syncState.consecutiveSyncAttempts = 0;
      syncState.lastSyncSuccess = true;
      syncState.lastSuccessTime = new Date().toISOString();
      syncState.lastSuccessfulSync = Date.now();
    } else {
      syncState.failedAttempts++;
      syncState.lastSyncSuccess = false;
    }
    
    return result;
  } catch (error) {
    console.error('خطأ في المزامنة الأولية:', error);
    syncState.failedAttempts++;
    syncState.lastSyncSuccess = false;
    return false;
  }
};

