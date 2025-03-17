
/**
 * Core functionality for syncing with a remote source
 * وظائف أساسية للمزامنة مع مصدر بعيد
 */

import { setIsSyncing } from '../../../dataStore';
import { fetchRemoteData, isRemoteUrlAccessible } from '../fetch';
import { storeRemoteData } from '../storeData';
import { setSyncActive } from '../../status';

/**
 * Synchronize with a specific remote source
 * المزامنة مع مصدر بعيد محدد
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: / Syncing with remote source: ${remoteUrl}`);
    
    // تعيين حالة المزامنة كنشطة
    // Set sync state as active
    setSyncActive(true);
    
    // تحقق مما إذا كان الرابط مصدرًا محليًا (يبدأ بـ /)
    // Check if the link is a local source (starts with /)
    const isLocalSource = remoteUrl.startsWith('/');
    
    // فحص إمكانية الوصول للرابط أولاً (لغير المصادر المحلية)
    // Check URL accessibility first (for non-local sources)
    if (!isLocalSource) {
      try {
        const isAccessible = await isRemoteUrlAccessible(remoteUrl);
        if (!isAccessible) {
          console.error(`تعذر الوصول إلى المصدر الخارجي: / Could not access remote source: ${remoteUrl}`);
          setSyncActive(false);
          return false;
        }
      } catch (accessError) {
        console.warn(`خطأ أثناء فحص إمكانية الوصول إلى / Error checking accessibility of ${remoteUrl}:`, accessError);
        // نستمر على أي حال، لنحاول تحميل البيانات
        // Continue anyway, try loading data
      }
    }
    
    setIsSyncing(true);
    
    // إضافة محاولات متعددة لتحميل البيانات (حتى 3 محاولات)
    // Add multiple attempts to load data (up to 3 attempts)
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        console.log(`محاولة تحميل البيانات / Attempting to load data ${attempts}/${maxAttempts} from ${remoteUrl}`);
        
        const data = await fetchRemoteData(remoteUrl);
        success = await storeRemoteData(data, remoteUrl);
        
        if (success) {
          console.log(`تمت المزامنة بنجاح مع / Successfully synced with ${remoteUrl} after ${attempts} attempt(s)`);
          return true;
        }
      } catch (attemptError) {
        console.error(`فشلت المحاولة / Failed attempt ${attempts}/${maxAttempts} to sync data from ${remoteUrl}:`, attemptError);
        
        if (attempts < maxAttempts) {
          // الانتظار قبل المحاولة التالية مع زيادة الوقت في كل مرة
          // Wait before next attempt with increased time each time
          const waitTime = 1000 * attempts;
          console.log(`الانتظار / Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!success) {
      console.error(`فشلت جميع محاولات المزامنة مع / All sync attempts failed with ${remoteUrl}`);
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي: / Error syncing with remote source:', error);
    return false;
  } finally {
    setIsSyncing(false);
    setSyncActive(false);
  }
};
