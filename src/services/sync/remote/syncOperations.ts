
/**
 * Primary operations for syncing with remote data sources
 */

import { setIsSyncing } from '../../dataStore';
import { fetchRemoteData, isRemoteUrlAccessible } from './fetchData';
import { storeRemoteData } from './storeData';
import { STORAGE_KEYS } from '../../config';
import { setSyncActive } from '../status';

// تحسين قائمة المصادر مع خادم احتياطي ودعم CORS
const BLADI_INFO_SOURCES = [
  // المصادر الرئيسية
  'https://bladitv.lovable.app/api/channels.json',
  'https://bladi-info.com/api/channels.json',
  
  // مصادر احتياطية بروتوكول HTTPS
  'https://bladiinfo-api.vercel.app/api/channels.json',
  'https://bladiinfo-backup.netlify.app/api/channels.json',
  
  // CDN للتغلب على مشاكل CORS
  'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/api/channels.json',
  
  // نقاط نهاية بديلة تدعم CORS
  'https://api.jsonbin.io/v3/b/bladiinfo-channels/latest',
  'https://api.npoint.io/bladiinfo-channels',
  
  // نسخة محلية محملة مع التطبيق كخيار أخير
  '/data/fallback-channels.json'
];

/**
 * Synchronize with a specific remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    
    // تعيين حالة المزامنة كنشطة
    setSyncActive(true);
    
    // تحقق مما إذا كان الرابط مصدرًا محليًا (يبدأ بـ /)
    const isLocalSource = remoteUrl.startsWith('/');
    
    // فحص إمكانية الوصول للرابط أولاً (لغير المصادر المحلية)
    if (!isLocalSource) {
      try {
        const isAccessible = await isRemoteUrlAccessible(remoteUrl);
        if (!isAccessible) {
          console.error(`تعذر الوصول إلى المصدر الخارجي: ${remoteUrl}`);
          setSyncActive(false);
          return false;
        }
      } catch (accessError) {
        console.warn(`خطأ أثناء فحص إمكانية الوصول إلى ${remoteUrl}:`, accessError);
        // نستمر على أي حال، لنحاول تحميل البيانات
      }
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

/**
 * استرجاع معلمات حماية التزامن من Vercel
 */
export const getSkewProtectionParams = (): string => {
  if (typeof window !== 'undefined' && window.ENV && 
      window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1' && 
      window.ENV.VERCEL_DEPLOYMENT_ID) {
    return `dpl=${window.ENV.VERCEL_DEPLOYMENT_ID}`;
  }
  return '';
};

