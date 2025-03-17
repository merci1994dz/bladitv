
import { setIsSyncing } from '../../dataStore';
import { setSyncActive } from '../status';
import { syncWithBladiInfo, checkBladiInfoAvailability } from '../remoteSync';
import { syncAllData } from './syncOperations';

/**
 * تهيئة عملية المزامنة
 */
export const initializeSyncProcess = async (): Promise<boolean> => {
  console.log('تهيئة عملية المزامنة...');
  
  try {
    // تحديد حالة المزامنة كنشطة
    setSyncActive(true);
    setIsSyncing(true);
    
    // التحقق من توفر مصادر البيانات
    const availableSource = await checkBladiInfoAvailability();
    
    if (availableSource) {
      console.log(`تم العثور على مصدر متاح للبيانات: ${availableSource}`);
      
      // محاولة المزامنة مع المصدر المتاح
      try {
        // محاولة المزامنة مع مواقع Bladi Info أولاً
        const bladiResult = await syncWithBladiInfo(false);
        if (bladiResult) {
          console.log('تمت المزامنة بنجاح مع مواقع Bladi Info');
          return true;
        }
      } catch (error) {
        console.error('فشلت المزامنة مع المصدر المتاح:', error);
      }
    }
    
    // استخدام المزامنة العادية إذا فشلت المزامنة مع المصدر المتاح
    return await syncAllData(false);
  } catch (error) {
    console.error('خطأ في تهيئة عملية المزامنة:', error);
    return false;
  } finally {
    // إعادة تعيين حالة المزامنة
    setIsSyncing(false);
    setSyncActive(false);
  }
};
