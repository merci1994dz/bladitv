
/**
 * دالة للتحقق وإجراء المزامنة الأولية عند بدء التطبيق
 * Function to check and perform initial sync at application startup
 */

import { setSyncActive } from '../status';
import { syncWithRemoteSource, syncWithBladiInfo, checkBladiInfoAvailability } from '../remoteSync';
import { syncWithLocalData } from '../local';
import { syncAllData } from './syncOperations';

/**
 * إجراء المزامنة الأولية عند بدء التطبيق
 * Perform initial sync at application startup
 * 
 * @returns وعد بنجاح أو فشل المزامنة / Promise with sync success or failure
 */
export const performInitialSync = async (): Promise<boolean> => {
  const { isSyncNeeded } = await import('../local');
  
  try {
    console.log('بدء المزامنة الأولية... / Starting initial sync...');
    const needsSync = isSyncNeeded();
    
    // تحديد حالة المزامنة على نشطة أثناء المزامنة الأولية
    // Set sync state to active during initial sync
    setSyncActive(true);
    
    // التحقق من وجود مصدر متاح
    // Check for available source
    console.log('التحقق من وجود مصدر متاح للمزامنة الأولية... / Checking for available source for initial sync...');
    const availableSource = await checkBladiInfoAvailability();
    
    if (needsSync) {
      console.log('التطبيق يحتاج إلى مزامنة البيانات / Application needs data sync');
      
      // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
      // Try to sync with available source directly if found
      if (availableSource) {
        try {
          console.log(`محاولة المزامنة مع المصدر المتاح: / Attempting to sync with available source: ${availableSource}`);
          const directResult = await syncWithRemoteSource(availableSource, true); // تغيير إلى true للمزامنة القسرية
          if (directResult) {
            console.log(`تمت المزامنة بنجاح مع المصدر المتاح: / Successfully synced with available source: ${availableSource}`);
            return true;
          }
        } catch (error) {
          console.error(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}:`, error);
        }
      }
      
      // محاولة مزامنة مع مواقع Bladi Info أولاً
      // Try to sync with Bladi Info sites first
      try {
        console.log('محاولة المزامنة مع مواقع Bladi Info... / Attempting to sync with Bladi Info sites...');
        const bladiResult = await syncWithBladiInfo(true); // تغيير إلى true للمزامنة القسرية
        if (bladiResult) {
          console.log('تمت المزامنة بنجاح مع مواقع Bladi Info / Successfully synced with Bladi Info sites');
          return true;
        }
      } catch (error) {
        console.error('فشلت المزامنة مع مواقع Bladi Info: / Failed to sync with Bladi Info sites:', error);
      }
    }
    
    // إذا لم تكن هناك حاجة للمزامنة أو فشلت المزامنة مع المواقع، استخدم المزامنة العادية
    // If no sync needed or failed to sync with sites, use regular sync
    return await syncAllData(true); // تغيير إلى true للمزامنة القسرية
  } catch (error) {
    console.error('فشلت المزامنة الأولية: / Initial sync failed:', error);
    
    // في حالة الفشل، استخدم البيانات المحلية على أي حال
    // In case of failure, use local data anyway
    try {
      await syncWithLocalData(false);
      return true;
    } catch (e) {
      console.error('فشل الرجوع إلى البيانات المحلية: / Failed to fall back to local data:', e);
      return false;
    }
  } finally {
    // إعادة تعيين حالة المزامنة
    // Reset sync state
    setSyncActive(false);
  }
};
