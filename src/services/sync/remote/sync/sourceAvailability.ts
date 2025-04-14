
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
  
  // تحسين: إضافة مصفوفة لتتبع نتائج المصادر
  const sourceResults: Record<string, boolean> = {};
  
  // فحص أولاً المصدر المحلي كخيار أسرع
  // Check local source first as it's faster
  const localSource = '/data/channels.json';
  
  try {
    const isLocalAccessible = await isRemoteUrlAccessible(localSource);
    sourceResults[localSource] = isLocalAccessible;
    
    if (isLocalAccessible) {
      console.log('المصدر المحلي متاح:', localSource);
      return localSource;
    }
  } catch (error) {
    console.warn('فشل التحقق من توفر المصدر المحلي:', error);
    sourceResults[localSource] = false;
  }
  
  // تحسين: استخدام Promise.allSettled لتحسين الأداء عند فحص المصادر المتعددة
  const remoteSourcesPromises = BLADI_INFO_SOURCES
    .filter(source => source !== localSource)
    .map(async (source) => {
      try {
        const isAccessible = await isRemoteUrlAccessible(source);
        sourceResults[source] = isAccessible;
        return { source, isAccessible };
      } catch (error) {
        console.warn(`فشل التحقق من توفر المصدر ${source}:`, error);
        sourceResults[source] = false;
        return { source, isAccessible: false };
      }
    });
  
  const results = await Promise.allSettled(remoteSourcesPromises);
  
  // تحسين: البحث عن أول مصدر متاح
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.isAccessible) {
      console.log('المصدر المتاح:', result.value.source);
      return result.value.source;
    }
  }
  
  // تسجيل نتائج جميع المصادر للتشخيص
  console.warn('لم يتم العثور على أي مصدر متاح', sourceResults);
  return null;
};
