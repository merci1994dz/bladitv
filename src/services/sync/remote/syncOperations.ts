
/**
 * Primary operations for syncing with remote data sources
 */

import { setIsSyncing } from '../../dataStore';
import { fetchRemoteData } from './fetchData';
import { storeRemoteData } from './storeData';
import { STORAGE_KEYS } from '../../config';

/**
 * Synchronize with a specific remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    setIsSyncing(true);
    
    const data = await fetchRemoteData(remoteUrl);
    const result = await storeRemoteData(data, remoteUrl);
    
    return result;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

/**
 * تنفيذ المزامنة مع Bladi Info - مع تحسين إدارة الأخطاء
 */
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  const urls = [
    'https://bladitv.lovable.app/api/channels.json', 
    'https://bladi-info.com/api/channels.json'
  ];
  
  let lastError: Error | null = null;
  
  for (const url of urls) {
    try {
      console.log(`محاولة المزامنة مع ${url}`);
      const result = await syncWithRemoteSource(url, forceRefresh);
      if (result) {
        console.log(`تمت المزامنة بنجاح مع ${url}`);
        // حفظ الرابط الناجح للاستخدام المستقبلي
        const remoteConfig = {
          url,
          lastSync: new Date().toISOString()
        };
        try {
          localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
        } catch (e) {
          console.error('خطأ في حفظ تكوين المصدر الخارجي:', e);
        }
        return true;
      }
    } catch (error) {
      console.error(`فشلت المزامنة مع ${url}:`, error);
      lastError = error as Error;
    }
  }
  
  console.error('فشلت جميع محاولات المزامنة مع المصادر الخارجية', lastError);
  return false;
};
