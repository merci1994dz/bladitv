
/**
 * Primary operations for syncing with remote data sources
 */

import { setIsSyncing } from '../../dataStore';
import { fetchRemoteData, isRemoteUrlAccessible } from './fetchData';
import { storeRemoteData } from './storeData';
import { STORAGE_KEYS } from '../../config';
import { setSyncActive } from '../status';

/**
 * Synchronize with a specific remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    
    // تعيين حالة المزامنة كنشطة
    setSyncActive(true);
    
    // فحص إمكانية الوصول للرابط أولاً
    const isAccessible = await isRemoteUrlAccessible(remoteUrl);
    if (!isAccessible) {
      console.error(`تعذر الوصول إلى المصدر الخارجي: ${remoteUrl}`);
      setSyncActive(false);
      return false;
    }
    
    setIsSyncing(true);
    
    // إضافة محاولات متعددة لتحميل البيانات (حتى 3 محاولات)
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        console.log(`محاولة تحميل البيانات ${attempts}/${maxAttempts} من ${remoteUrl}`);
        
        const data = await fetchRemoteData(remoteUrl);
        success = await storeRemoteData(data, remoteUrl);
        
        if (success) {
          console.log(`تمت المزامنة بنجاح مع ${remoteUrl} بعد ${attempts} محاولة/محاولات`);
          return true;
        }
      } catch (attemptError) {
        console.error(`فشلت المحاولة ${attempts}/${maxAttempts} لمزامنة البيانات من ${remoteUrl}:`, attemptError);
        
        if (attempts < maxAttempts) {
          // الانتظار قبل المحاولة التالية مع زيادة الوقت في كل مرة
          const waitTime = 1000 * attempts;
          console.log(`الانتظار ${waitTime}ms قبل المحاولة التالية...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!success) {
      console.error(`فشلت جميع محاولات المزامنة مع ${remoteUrl}`);
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
    setSyncActive(false);
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
    'https://bladiinfo-backup.netlify.app/api/channels.json', // نسخة احتياطية على Netlify
    'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/api/channels.json' // نسخة احتياطية على JSDelivr/GitHub
  ];
  
  let successCount = 0;
  let lastError: Error | null = null;
  
  // تعيين حالة المزامنة كنشطة
  setSyncActive(true);
  
  try {
    // فحص إمكانية الوصول لجميع الروابط أولاً مع زيادة المهلة
    console.log('التحقق من إمكانية الوصول إلى روابط Bladi Info...');
    const accessibleUrls = [];
    
    for (const url of urls) {
      try {
        console.log(`فحص إمكانية الوصول إلى ${url}...`);
        const isAccessible = await isRemoteUrlAccessible(url);
        if (isAccessible) {
          accessibleUrls.push(url);
          console.log(`الرابط ${url} متاح للوصول ✓`);
        } else {
          console.warn(`الرابط ${url} غير متاح للوصول ✗`);
        }
      } catch (e) {
        console.warn(`خطأ عند فحص إمكانية الوصول للرابط ${url}:`, e);
      }
    }
    
    if (accessibleUrls.length === 0) {
      console.error('جميع روابط Bladi Info غير متاحة للوصول');
      return false;
    }
    
    console.log(`تم العثور على ${accessibleUrls.length} رابط متاح للوصول`);
    
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
  } finally {
    setSyncActive(false);
  }
};

/**
 * تحقق من توفر أي من روابط Bladi Info
 */
export const checkBladiInfoAvailability = async (): Promise<string | null> => {
  const urls = [
    'https://bladitv.lovable.app/api/channels.json', 
    'https://bladi-info.com/api/channels.json',
    'https://bladiinfo-api.vercel.app/api/channels.json', 
    'https://bladiinfo-backup.netlify.app/api/channels.json',
    'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/api/channels.json'
  ];
  
  // محاولة الوصول لكل رابط مع زيادة المهلة
  for (const url of urls) {
    try {
      console.log(`فحص إمكانية الوصول إلى ${url}...`);
      const isAccessible = await isRemoteUrlAccessible(url);
      if (isAccessible) {
        console.log(`الرابط ${url} متاح للوصول ✓`);
        return url;
      }
      console.warn(`الرابط ${url} غير متاح للوصول ✗`);
    } catch (e) {
      console.warn(`خطأ عند فحص إمكانية الوصول للرابط ${url}:`, e);
    }
  }
  
  console.error('لم يتم العثور على أي رابط متاح من Bladi Info');
  return null;
};
