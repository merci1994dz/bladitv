
/**
 * Primary operations for syncing with remote data sources
 */

import { setIsSyncing } from '../../dataStore';
import { fetchRemoteData, isRemoteUrlAccessible } from './fetchData';
import { storeRemoteData } from './storeData';
import { STORAGE_KEYS } from '../../config';

/**
 * Synchronize with a specific remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    
    // فحص إمكانية الوصول للرابط أولاً
    const isAccessible = await isRemoteUrlAccessible(remoteUrl);
    if (!isAccessible) {
      console.error(`تعذر الوصول إلى المصدر الخارجي: ${remoteUrl}`);
      return false;
    }
    
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
 * تنفيذ المزامنة مع Bladi Info - مع محاولات متعددة
 */
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  const urls = [
    'https://bladitv.lovable.app/api/channels.json', 
    'https://bladi-info.com/api/channels.json',
    'https://bladiinfo-api.vercel.app/api/channels.json', // نسخة احتياطية على Vercel
    'https://bladiinfo-backup.netlify.app/api/channels.json' // نسخة احتياطية على Netlify
  ];
  
  let successCount = 0;
  let lastError: Error | null = null;
  
  // فحص إمكانية الوصول لجميع الروابط أولاً
  const accessibleUrls = [];
  for (const url of urls) {
    try {
      const isAccessible = await isRemoteUrlAccessible(url);
      if (isAccessible) {
        accessibleUrls.push(url);
        console.log(`الرابط ${url} متاح للوصول`);
      } else {
        console.warn(`الرابط ${url} غير متاح للوصول`);
      }
    } catch (e) {
      console.warn(`خطأ عند فحص إمكانية الوصول للرابط ${url}:`, e);
    }
  }
  
  if (accessibleUrls.length === 0) {
    console.error('جميع روابط Bladi Info غير متاحة للوصول');
    return false;
  }
  
  // محاولة المزامنة مع الروابط المتاحة فقط
  for (const url of accessibleUrls) {
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
        successCount++;
        return true;
      }
    } catch (error) {
      console.error(`فشلت المزامنة مع ${url}:`, error);
      lastError = error as Error;
    }
  }
  
  if (successCount === 0) {
    console.error('فشلت جميع محاولات المزامنة مع المصادر الخارجية', lastError);
    return false;
  }
  
  return successCount > 0;
};

/**
 * تحقق من توفر أي من روابط Bladi Info
 */
export const checkBladiInfoAvailability = async (): Promise<string | null> => {
  const urls = [
    'https://bladitv.lovable.app/api/channels.json', 
    'https://bladi-info.com/api/channels.json',
    'https://bladiinfo-api.vercel.app/api/channels.json', 
    'https://bladiinfo-backup.netlify.app/api/channels.json'
  ];
  
  for (const url of urls) {
    try {
      const isAccessible = await isRemoteUrlAccessible(url);
      if (isAccessible) {
        return url;
      }
    } catch (e) {
      console.warn(`خطأ عند فحص إمكانية الوصول للرابط ${url}:`, e);
    }
  }
  
  return null;
};
