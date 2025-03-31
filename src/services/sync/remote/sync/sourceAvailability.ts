
/**
 * فحص توفر مصادر Bladi Info
 * Check availability of Bladi Info sources
 */

import { isRemoteUrlAccessible } from '../fetch';
import { BLADI_INFO_SOURCES } from './sources';

/**
 * فحص توفر أي من مصادر Bladi Info
 * Check if any Bladi Info source is available
 * 
 * @returns عنوان URL للمصدر المتاح، أو null إذا لم يكن هناك مصدر متاح
 */
export const checkBladiInfoAvailability = async (): Promise<string | null> => {
  console.log('التحقق من توفر مصادر Bladi Info...');
  
  // أولاً، محاولة الوصول إلى المصادر المحلية (للتطوير)
  // First, try to access local sources (for development)
  for (const source of BLADI_INFO_SOURCES) {
    if (source.startsWith('/')) {
      try {
        const response = await fetch(source);
        
        if (response.ok) {
          console.log(`المصدر المحلي متاح: ${source}`);
          return source;
        }
      } catch (error) {
        console.warn(`تعذر الوصول إلى المصدر المحلي ${source}:`, error);
      }
    }
  }
  
  // ثم، محاولة الوصول إلى المصادر الخارجية
  // Then, try to access external sources
  for (const source of BLADI_INFO_SOURCES) {
    if (!source.startsWith('/')) {
      try {
        const isAccessible = await isRemoteUrlAccessible(source);
        
        if (isAccessible) {
          console.log(`المصدر الخارجي متاح: ${source}`);
          return source;
        }
      } catch (error) {
        console.warn(`تعذر الوصول إلى المصدر الخارجي ${source}:`, error);
      }
    }
  }
  
  console.log('لم يتم العثور على أي مصدر متاح');
  return null;
};
