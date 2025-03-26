
/**
 * Functionality for checking availability of remote sources
 */

import { STORAGE_KEYS } from '../../../config';
import { BLADI_INFO_SOURCES } from './sources';

/**
 * فحص توفر مصادر Bladi Info والعودة بأول مصدر متاح
 * Check availability of Bladi Info sources and return the first available source
 */
export const checkBladiInfoAvailability = async (): Promise<string | null> => {
  // أولاً، التحقق من آخر مصدر ناجح
  // First, check the last successful source
  try {
    const lastSuccessfulSource = localStorage.getItem(STORAGE_KEYS.LAST_SUCCESSFUL_SOURCE);
    if (lastSuccessfulSource) {
      console.log(`التحقق من آخر مصدر ناجح: ${lastSuccessfulSource}`);
      
      // المصادر المحلية دائمًا متاحة
      // Local sources are always available
      if (lastSuccessfulSource.startsWith('/')) {
        return lastSuccessfulSource;
      }
      
      // فحص إمكانية الوصول للمصدر الخارجي
      // Check accessibility of external source
      try {
        const { isRemoteUrlAccessible } = await import('../fetch');
        const isAccessible = await isRemoteUrlAccessible(lastSuccessfulSource);
        
        if (isAccessible) {
          console.log(`آخر مصدر ناجح لا يزال متاحًا: ${lastSuccessfulSource}`);
          return lastSuccessfulSource;
        } else {
          console.log(`آخر مصدر ناجح لم يعد متاحًا: ${lastSuccessfulSource}`);
        }
      } catch (e) {
        console.warn(`فشل فحص إمكانية الوصول إلى آخر مصدر ناجح:`, e);
      }
    }
  } catch (e) {
    // تجاهل أخطاء التخزين
    // Ignore storage errors
  }
  
  // ترتيب المصادر حسب الأولوية
  // Order sources by priority
  const prioritySources = [
    // المصادر المحلية أولاً (الأكثر موثوقية)
    // Local sources first (most reliable)
    ...BLADI_INFO_SOURCES.filter(url => url.startsWith('/')),
    
    // ثم CDNs
    // Then CDNs
    ...BLADI_INFO_SOURCES.filter(url => url.includes('cdn.jsdelivr.net')),
    
    // ثم باقي المصادر
    // Then remaining sources
    ...BLADI_INFO_SOURCES.filter(url => !url.startsWith('/') && !url.includes('cdn.jsdelivr.net'))
  ];
  
  // جعل القائمة فريدة (بدون تكرار)
  // Make the list unique (without duplicates)
  const uniqueSources = [...new Set(prioritySources)];
  
  // تنفيذ الفحص بالتوازي لتحسين الأداء
  // Perform checks in parallel to improve performance
  const accessibilityChecks = uniqueSources.map(async (url) => {
    try {
      // المصادر المحلية دائمًا متاحة
      // Local sources are always available
      if (url.startsWith('/')) {
        return { url, isAccessible: true };
      }
      
      // فحص إمكانية الوصول للمصادر الخارجية
      // Check accessibility of external sources
      const { isRemoteUrlAccessible } = await import('../fetch');
      const isAccessible = await isRemoteUrlAccessible(url);
      
      return { url, isAccessible };
    } catch (error) {
      console.warn(`خطأ أثناء فحص ${url}:`, error);
      return { url, isAccessible: false };
    }
  });
  
  // انتظار اكتمال الفحوصات المتوازية
  // Wait for parallel checks to complete
  const results = await Promise.all(accessibilityChecks);
  
  // العثور على أول مصدر متاح
  // Find the first available source
  const availableSource = results.find(result => result.isAccessible);
  
  if (availableSource) {
    return availableSource.url;
  }
  
  return null;
};
