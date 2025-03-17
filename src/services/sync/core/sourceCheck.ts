
import { checkBladiInfoAvailability } from '../remoteSync';
import { isRemoteUrlAccessible } from '../remote/fetch';

/**
 * التحقق من توفر مصادر البيانات المختلفة
 * Check availability of different data sources
 */
export const checkSourceAvailability = async (): Promise<{
  hasBladi: boolean;
  hasRemote: boolean;
  availableSource: string | null;
}> => {
  try {
    console.log('التحقق من توفر مصادر البيانات... / Checking for available data sources...');
    
    // التحقق من توفر مصادر Bladi Info
    // Check availability of Bladi Info sources
    const availableSource = await checkBladiInfoAvailability();
    const hasBladi = !!availableSource;
    
    // التحقق من توفر المصادر البديلة
    // Check availability of fallback sources
    const fallbackSources = [
      'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json',
      'https://raw.githubusercontent.com/bladitv/channels/master/channels.json'
    ];
    
    let hasRemote = false;
    
    // التحقق من كل مصدر بديل
    // Check each fallback source
    for (const source of fallbackSources) {
      try {
        const isAccessible = await isRemoteUrlAccessible(source);
        if (isAccessible) {
          hasRemote = true;
          break;
        }
      } catch (error) {
        console.log(`تعذر الوصول إلى المصدر البديل: / Could not access fallback source: ${source}`);
      }
    }
    
    return {
      hasBladi,
      hasRemote,
      availableSource
    };
  } catch (error) {
    console.error('خطأ في التحقق من توفر المصادر: / Error checking source availability:', error);
    return {
      hasBladi: false,
      hasRemote: false,
      availableSource: null
    };
  }
};
