
/**
 * Functionality for syncing with Bladi Info sources
 */

import { STORAGE_KEYS } from '../../../config';
import { syncWithRemoteSource } from './syncWithRemote';
import { BLADI_INFO_SOURCES } from './sources';

/**
 * تنفيذ المزامنة مع Bladi Info - مع محاولات متعددة
 */
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  // تحقق من توفر مصدر أولاً
  const availableSource = await checkBladiInfoAvailability();
  if (availableSource) {
    console.log(`استخدام المصدر المتاح: ${availableSource}`);
    return await syncWithRemoteSource(availableSource, forceRefresh);
  }
  
  // إذا لم يكن هناك مصدر متاح، جرب جميع المصادر
  console.log('محاولة الاتصال بجميع مصادر Bladi Info...');
  
  for (const url of BLADI_INFO_SOURCES) {
    console.log(`فحص إمكانية الوصول إلى ${url}...`);
    
    try {
      // نتحقق مما إذا كان المصدر متاحًا وقابلاً للوصول
      const isLocalSource = url.startsWith('/');
      const { isRemoteUrlAccessible } = await import('../fetch');
      const isAccessible = isLocalSource || await isRemoteUrlAccessible(url);
      
      if (isAccessible) {
        console.log(`الرابط ${url} متاح للوصول ✓`);
        try {
          // محاولة المزامنة مع هذا المصدر
          const success = await syncWithRemoteSource(url, forceRefresh);
          if (success) {
            console.log(`تمت المزامنة بنجاح مع ${url}`);
            
            // تخزين الرابط الناجح للاستخدام في المستقبل
            try {
              localStorage.setItem(STORAGE_KEYS.LAST_SUCCESSFUL_SOURCE, url);
            } catch (e) {
              // تجاهل أخطاء التخزين
            }
            
            return true;
          }
        } catch (syncError) {
          console.error(`فشلت المزامنة مع ${url}:`, syncError);
        }
      } else {
        console.warn(`الرابط ${url} غير متاح للوصول ✗`);
      }
    } catch (error) {
      console.warn(`خطأ أثناء فحص ${url}:`, error);
    }
  }
  
  console.error('جميع روابط Bladi Info غير متاحة للوصول');
  return false;
};

/**
 * فحص توفر مصادر Bladi Info والعودة بأول مصدر متاح
 */
export const checkBladiInfoAvailability = async (): Promise<string | null> => {
  // أولاً، التحقق من آخر مصدر ناجح
  try {
    const lastSuccessfulSource = localStorage.getItem(STORAGE_KEYS.LAST_SUCCESSFUL_SOURCE);
    if (lastSuccessfulSource) {
      console.log(`التحقق من آخر مصدر ناجح: ${lastSuccessfulSource}`);
      const { isRemoteUrlAccessible } = await import('../fetch');
      const isAccessible = lastSuccessfulSource.startsWith('/') || 
                          await isRemoteUrlAccessible(lastSuccessfulSource);
      
      if (isAccessible) {
        console.log(`آخر مصدر ناجح لا يزال متاحًا: ${lastSuccessfulSource}`);
        return lastSuccessfulSource;
      }
    }
  } catch (e) {
    // تجاهل أخطاء التخزين
  }
  
  // إذا كان آخر مصدر ناجح غير متاح، جرب جميع المصادر
  for (const url of BLADI_INFO_SOURCES) {
    try {
      const isLocalSource = url.startsWith('/');
      const { isRemoteUrlAccessible } = await import('../fetch');
      const isAccessible = isLocalSource || await isRemoteUrlAccessible(url);
      
      if (isAccessible) {
        return url;
      }
    } catch (error) {
      console.warn(`خطأ أثناء فحص ${url}:`, error);
    }
  }
  
  return null;
};

