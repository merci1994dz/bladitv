
/**
 * وظيفة المزامنة الموحدة التي تجمع بين جميع طرق المزامنة
 * Unified sync function that combines all sync methods
 */

import { syncAllData } from './syncOperations';
import { syncWithBladiInfo } from '../remoteSync';
import { updateLastSyncTime } from '../status/timestamp';
import { setIsSyncing } from '../../dataStore';

interface SyncOptions {
  forceRefresh?: boolean;
  preventDuplicates?: boolean;
  showNotifications?: boolean;
  onComplete?: (success: boolean) => void;
}

/**
 * مزامنة البيانات باستخدام نهج موحد
 * Sync data using a unified approach
 */
export const syncDataUnified = async (options: SyncOptions = {}): Promise<boolean> => {
  const { 
    forceRefresh = false, 
    preventDuplicates = true,
    showNotifications = true,
    onComplete
  } = options;
  
  try {
    console.log('بدء عملية المزامنة الموحدة...');
    setIsSyncing(true);
    
    // محاولة المزامنة مع Bladi Info أولاً
    console.log('محاولة المزامنة مع Bladi Info...');
    const bladiResult = await syncWithBladiInfo(forceRefresh, { preventDuplicates });
    
    if (bladiResult.updated) {
      console.log(`تمت المزامنة بنجاح مع Bladi Info. تم إضافة ${bladiResult.channelsCount} قناة.`);
      updateLastSyncTime();
      
      if (onComplete) {
        onComplete(true);
      }
      
      return true;
    }
    
    // إذا فشلت المزامنة مع Bladi Info، حاول استخدام المزامنة الأساسية
    console.log('فشلت المزامنة مع Bladi Info، محاولة استخدام المزامنة الأساسية...');
    const coreResult = await syncAllData(forceRefresh);
    
    if (coreResult) {
      console.log('تمت المزامنة بنجاح باستخدام المزامنة الأساسية.');
      
      if (onComplete) {
        onComplete(true);
      }
      
      return true;
    }
    
    console.log('فشلت جميع محاولات المزامنة.');
    
    if (onComplete) {
      onComplete(false);
    }
    
    return false;
  } catch (error) {
    console.error('خطأ في عملية المزامنة الموحدة:', error);
    
    if (onComplete) {
      onComplete(false);
    }
    
    return false;
  } finally {
    setIsSyncing(false);
  }
};
