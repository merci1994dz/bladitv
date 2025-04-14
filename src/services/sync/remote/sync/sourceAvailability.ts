
import { BLADI_INFO_SOURCES } from './sources';
import { isRemoteUrlAccessible } from '../fetch/fetchRemoteData';

/**
 * التحقق من توفر مصادر Bladi Info
 * Check availability of Bladi Info sources
 * 
 * @returns {Promise<string | null>} المصدر المتاح أو null إذا لم يتم العثور على أي مصدر متاح
 */
export const checkBladiInfoAvailability = async (): Promise<string | null> => {
  console.log('التحقق من توفر مصادر Bladi Info...');
  
  // فحص أولاً المصدر المحلي كخيار أسرع
  // Check local source first as it's faster
  const localSource = '/data/channels.json';
  
  try {
    const isLocalAccessible = await isRemoteUrlAccessible(localSource);
    if (isLocalAccessible) {
      console.log('المصدر المحلي متاح:', localSource);
      return localSource;
    }
  } catch (error) {
    console.warn('فشل التحقق من توفر المصدر المحلي:', error);
  }
  
  // لم يكن المصدر المحلي متاحًا، جارٍ التحقق من المصادر الخارجية
  // Local source wasn't available, checking external sources
  for (const source of BLADI_INFO_SOURCES) {
    if (source === localSource) continue; // تم التحقق بالفعل من المصدر المحلي / Already checked local source
    
    try {
      const isAccessible = await isRemoteUrlAccessible(source);
      if (isAccessible) {
        console.log('المصدر المتاح:', source);
        return source;
      }
    } catch (error) {
      console.warn(`فشل التحقق من توفر المصدر ${source}:`, error);
    }
  }
  
  console.warn('لم يتم العثور على أي مصدر متاح');
  return null;
};
