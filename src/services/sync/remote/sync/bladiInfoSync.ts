
/**
 * Functionality for syncing with Bladi Info sources
 */

import { STORAGE_KEYS } from '../../../config';
import { syncWithRemoteSource } from './syncWithRemote';
import { BLADI_INFO_SOURCES } from './sources';

// Export for external use
export { syncWithRemoteSource };

/**
 * تنفيذ المزامنة مع Bladi Info - مع محاولات متعددة
 */
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  // تحقق من توفر مصدر أولاً
  const availableSource = await checkBladiInfoAvailability();
  
  if (availableSource) {
    console.log(`استخدام المصدر المتاح: ${availableSource}`);
    
    try {
      const success = await syncWithRemoteSource(availableSource, forceRefresh);
      
      if (success) {
        console.log(`تمت المزامنة بنجاح مع ${availableSource}`);
        return true;
      } else {
        console.warn(`فشلت المزامنة مع المصدر المتاح، جاري تجربة مصادر أخرى...`);
      }
    } catch (error) {
      console.error(`فشلت المزامنة مع المصدر المتاح ${availableSource}:`, error);
    }
  } else {
    console.log('لم يتم العثور على مصدر متاح بعد، جاري فحص جميع المصادر...');
  }
  
  // إذا لم يكن هناك مصدر متاح أو فشل المصدر المتاح، جرب جميع المصادر
  console.log('محاولة الاتصال بجميع مصادر Bladi Info...');
  
  // تقسيم المصادر إلى مجموعات للتنفيذ المتوازي
  const batchSize = 3;
  const sourceGroups = [];
  
  for (let i = 0; i < BLADI_INFO_SOURCES.length; i += batchSize) {
    sourceGroups.push(BLADI_INFO_SOURCES.slice(i, i + batchSize));
  }
  
  // فحص كل مجموعة من المصادر بالتوازي لتحسين الأداء
  for (const sourceGroup of sourceGroups) {
    // إعداد وعود للفحص المتوازي
    const accessibilityChecks = sourceGroup.map(async (url) => {
      try {
        console.log(`فحص إمكانية الوصول إلى ${url}...`);
        
        // نتحقق مما إذا كان المصدر متاحًا وقابلاً للوصول
        const isLocalSource = url.startsWith('/');
        
        if (isLocalSource) {
          return { url, isAccessible: true };
        }
        
        const { isRemoteUrlAccessible } = await import('../fetch');
        const isAccessible = await isRemoteUrlAccessible(url);
        
        return { url, isAccessible };
      } catch (error) {
        console.warn(`خطأ أثناء فحص ${url}:`, error);
        return { url, isAccessible: false };
      }
    });
    
    // انتظار اكتمال الفحوصات المتوازية
    const results = await Promise.all(accessibilityChecks);
    
    // محاولة المزامنة مع المصادر المتاحة
    for (const { url, isAccessible } of results) {
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
    }
  }
  
  // محاولة استخدام المصدر المحلي كخيار أخير
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
      
      // المصادر المحلية دائمًا متاحة
      if (lastSuccessfulSource.startsWith('/')) {
        return lastSuccessfulSource;
      }
      
      // فحص إمكانية الوصول للمصدر الخارجي
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
  }
  
  // ترتيب المصادر حسب الأولوية
  const prioritySources = [
    // المصادر المحلية أولاً (الأكثر موثوقية)
    ...BLADI_INFO_SOURCES.filter(url => url.startsWith('/')),
    
    // ثم CDNs
    ...BLADI_INFO_SOURCES.filter(url => url.includes('cdn.jsdelivr.net')),
    
    // ثم باقي المصادر
    ...BLADI_INFO_SOURCES.filter(url => !url.startsWith('/') && !url.includes('cdn.jsdelivr.net'))
  ];
  
  // جعل القائمة فريدة (بدون تكرار)
  const uniqueSources = [...new Set(prioritySources)];
  
  // تنفيذ الفحص بالتوازي لتحسين الأداء
  const accessibilityChecks = uniqueSources.map(async (url) => {
    try {
      // المصادر المحلية دائمًا متاحة
      if (url.startsWith('/')) {
        return { url, isAccessible: true };
      }
      
      // فحص إمكانية الوصول للمصادر الخارجية
      const { isRemoteUrlAccessible } = await import('../fetch');
      const isAccessible = await isRemoteUrlAccessible(url);
      
      return { url, isAccessible };
    } catch (error) {
      console.warn(`خطأ أثناء فحص ${url}:`, error);
      return { url, isAccessible: false };
    }
  });
  
  // انتظار اكتمال الفحوصات المتوازية
  const results = await Promise.all(accessibilityChecks);
  
  // العثور على أول مصدر متاح
  const availableSource = results.find(result => result.isAccessible);
  
  if (availableSource) {
    return availableSource.url;
  }
  
  return null;
};
