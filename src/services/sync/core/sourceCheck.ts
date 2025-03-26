
/**
 * وظائف التحقق من توفر مصادر البيانات
 * Functions to check data source availability
 */

import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';

/**
 * التحقق من توفر مصادر البيانات مع دعم إعادة المحاولة
 * Check data source availability with retry support
 */
export const checkSourceAvailability = async (retries = 2): Promise<string | null> => {
  let attemptsLeft = retries;
  let availableSource = null;
  
  while (attemptsLeft >= 0 && !availableSource) {
    try {
      availableSource = await checkBladiInfoAvailability();
      
      if (availableSource) {
        console.log(`تم العثور على مصدر متاح بعد ${retries - attemptsLeft} محاولة: ${availableSource}`);
        return availableSource;
      }
      
      attemptsLeft--;
      
      if (attemptsLeft >= 0 && !availableSource) {
        // الانتظار قبل المحاولة التالية
        console.log(`لم يتم العثور على مصدر متاح، إعادة المحاولة بعد 1500ms (${attemptsLeft} محاولات متبقية)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error('خطأ أثناء التحقق من توفر المصادر:', error);
      attemptsLeft--;
      
      if (attemptsLeft >= 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
  
  if (!availableSource) {
    console.warn('لم يتم العثور على أي مصدر متاح بعد جميع المحاولات');
  }
  
  return availableSource;
};
