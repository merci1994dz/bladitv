
/**
 * Functionality for synchronizing with multiple sources
 */

import { STORAGE_KEYS } from '../../../config';
import { syncWithRemoteSource } from './syncWithRemote';

/**
 * محاولة المزامنة مع مجموعة من المصادر بالتتابع
 * Attempt to sync with a group of sources sequentially
 * 
 * @param sources مصفوفة من روابط المصادر
 * @param forceRefresh تجاهل ذاكرة التخزين المؤقت
 */
export const syncWithSourceGroup = async (
  sources: string[],
  forceRefresh: boolean = false
): Promise<boolean> => {
  for (const url of sources) {
    try {
      // تحقق من إمكانية الوصول للمصدر
      // Check source accessibility
      const isLocalSource = url.startsWith('/');
      let isAccessible = isLocalSource;
      
      if (!isLocalSource) {
        const { isRemoteUrlAccessible } = await import('../fetch');
        isAccessible = await isRemoteUrlAccessible(url);
      }
      
      if (isAccessible) {
        console.log(`الرابط ${url} متاح للوصول ✓`);
        // محاولة المزامنة مع هذا المصدر
        // Attempt to sync with this source
        const success = await syncWithRemoteSource(url, forceRefresh);
        if (success) {
          console.log(`تمت المزامنة بنجاح مع ${url}`);
          
          // تخزين الرابط الناجح للاستخدام في المستقبل
          // Store successful source for future use
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SUCCESSFUL_SOURCE, url);
          } catch (e) {
            // تجاهل أخطاء التخزين
            // Ignore storage errors
          }
          
          return true;
        }
      } else {
        console.warn(`الرابط ${url} غير متاح للوصول ✗`);
      }
    } catch (syncError) {
      console.error(`فشلت المزامنة مع ${url}:`, syncError);
    }
  }
  
  return false;
};

/**
 * استخدام المصدر المحلي كخيار أخير
 * Use local source as a last resort
 */
export const syncWithLocalFallback = async (forceRefresh: boolean = false): Promise<boolean> => {
  const localSource = '/data/fallback-channels.json';
  console.log(`محاولة استخدام المصدر المحلي: ${localSource}`);
  
  try {
    const success = await syncWithRemoteSource(localSource, forceRefresh);
    if (success) {
      console.log(`تمت المزامنة بنجاح مع المصدر المحلي`);
      return true;
    }
  } catch (e) {
    console.error('فشلت المزامنة مع المصدر المحلي:', e);
  }
  
  return false;
};
