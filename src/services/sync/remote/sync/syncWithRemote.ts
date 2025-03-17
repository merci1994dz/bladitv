
/**
 * Core functionality for syncing with a remote source
 */

import { setIsSyncing } from '../../../dataStore';
import { fetchRemoteData, isRemoteUrlAccessible } from '../fetch';
import { storeRemoteData } from '../storeData';
import { setSyncActive } from '../../status';

/**
 * Synchronize with a specific remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    
    // تعيين حالة المزامنة كنشطة
    setSyncActive(true);
    
    // تحقق مما إذا كان الرابط مصدرًا محليًا (يبدأ بـ /)
    const isLocalSource = remoteUrl.startsWith('/');
    
    // فحص إمكانية الوصول للرابط أولاً (لغير المصادر المحلية)
    if (!isLocalSource) {
      try {
        const isAccessible = await isRemoteUrlAccessible(remoteUrl);
        if (!isAccessible) {
          console.error(`تعذر الوصول إلى المصدر الخارجي: ${remoteUrl}`);
          setSyncActive(false);
          return false;
        }
      } catch (accessError) {
        console.warn(`خطأ أثناء فحص إمكانية الوصول إلى ${remoteUrl}:`, accessError);
        // نستمر على أي حال، لنحاول تحميل البيانات
      }
    }
    
    setIsSyncing(true);
    
    // إضافة محاولات متعددة لتحميل البيانات (حتى 3 محاولات)
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        console.log(`محاولة تحميل البيانات ${attempts}/${maxAttempts} من ${remoteUrl}`);
        
        const data = await fetchRemoteData(remoteUrl);
        success = await storeRemoteData(data, remoteUrl);
        
        if (success) {
          console.log(`تمت المزامنة بنجاح مع ${remoteUrl} بعد ${attempts} محاولة/محاولات`);
          return true;
        }
      } catch (attemptError) {
        console.error(`فشلت المحاولة ${attempts}/${maxAttempts} لمزامنة البيانات من ${remoteUrl}:`, attemptError);
        
        if (attempts < maxAttempts) {
          // الانتظار قبل المحاولة التالية مع زيادة الوقت في كل مرة
          const waitTime = 1000 * attempts;
          console.log(`الانتظار ${waitTime}ms قبل المحاولة التالية...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!success) {
      console.error(`فشلت جميع محاولات المزامنة مع ${remoteUrl}`);
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
    setSyncActive(false);
  }
};

