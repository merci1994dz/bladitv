
import { setIsSyncing } from '../../dataStore';
import { setSyncActive } from '../status';
import { syncWithBladiInfo, checkBladiInfoAvailability } from '../remoteSync';
import { syncAllData } from './syncOperations';

/**
 * تهيئة عملية المزامنة
 * Initialize the synchronization process
 */
export const initializeSyncProcess = async (): Promise<boolean> => {
  console.log('تهيئة عملية المزامنة... / Initializing sync process...');
  
  try {
    // تحديد حالة المزامنة كنشطة
    // Set sync state as active
    setSyncActive(true);
    setIsSyncing(true);
    
    // التحقق من توفر مصادر البيانات
    // Check for available data sources
    const availableSource = await checkBladiInfoAvailability();
    
    if (availableSource) {
      console.log(`تم العثور على مصدر متاح للبيانات: / Found available data source: ${availableSource}`);
      
      // محاولة المزامنة مع المصدر المتاح
      // Try to sync with available source
      try {
        // محاولة المزامنة مع مواقع Bladi Info أولاً
        // Try to sync with Bladi Info sites first
        const bladiResult = await syncWithBladiInfo(false);
        if (bladiResult) {
          console.log('تمت المزامنة بنجاح مع مواقع Bladi Info / Successfully synced with Bladi Info sites');
          return true;
        }
      } catch (error) {
        console.error('فشلت المزامنة مع المصدر المتاح: / Failed to sync with available source:', error);
      }
    }
    
    // استخدام المزامنة العادية إذا فشلت المزامنة مع المصدر المتاح
    // Use regular sync if sync with available source failed
    return await syncAllData(false);
  } catch (error) {
    console.error('خطأ في تهيئة عملية المزامنة: / Error initializing sync process:', error);
    return false;
  } finally {
    // إعادة تعيين حالة المزامنة
    // Reset sync state
    setIsSyncing(false);
    setSyncActive(false);
  }
};
