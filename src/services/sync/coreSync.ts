
import { REMOTE_CONFIG, STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { getRemoteConfig } from './remote';
import { syncWithRemoteSource, syncWithBladiInfo } from './remoteSync';
import { syncWithLocalData } from './local';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from './syncLock';

// استرجاع معلمات حماية التزامن من Vercel
const getSkewProtectionParams = (): string => {
  if (typeof window !== 'undefined' && window.ENV && 
      window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1' && 
      window.ENV.VERCEL_DEPLOYMENT_ID) {
    return `dpl=${window.ENV.VERCEL_DEPLOYMENT_ID}`;
  }
  return '';
};

// Main sync function - محسنة مع آلية قفل آمنة ومعالجة الطوابير
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  // إذا كانت المزامنة قيد التنفيذ، إضافة الطلب إلى الطابور
  if (isSyncLocked()) {
    console.log('المزامنة قيد التنفيذ بالفعل، إضافة الطلب إلى الطابور');
    
    // إضافة الوظيفة إلى الطابور (إعادة استدعاء النفس)
    return addToSyncQueue(() => syncAllData(forceRefresh));
  }
  
  // وضع قفل المزامنة
  setSyncLock();
  setIsSyncing(true);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري =', forceRefresh);
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting) مع دعم حماية التزامن
    const skewParam = getSkewProtectionParams();
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    const fullCacheBuster = skewParam ? `${cacheBuster}&${skewParam}` : cacheBuster;
    
    // تحديد مهلة زمنية للمزامنة لمنع التعليق إلى ما لا نهاية
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('تم تجاوز الوقت المخصص للمزامنة');
        resolve(false);
      }, 20000); // تقليل المهلة إلى 20 ثانية
    });
    
    // محاولة المزامنة مع مواقع Bladi Info أولاً
    const syncPromise = (async () => {
      try {
        const bladiInfoResult = await syncWithBladiInfo(forceRefresh);
        if (bladiInfoResult) {
          return true;
        }
        
        // التحقق من وجود تكوين خارجي
        const remoteConfig = getRemoteConfig();
        if (REMOTE_CONFIG.ENABLED && remoteConfig && remoteConfig.url) {
          try {
            // إضافة معامل كسر التخزين المؤقت للرابط مع دعم حماية التزامن
            const urlWithCacheBuster = remoteConfig.url.includes('?') 
              ? `${remoteConfig.url}&_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}${skewParam ? `&${skewParam}` : ''}` 
              : `${remoteConfig.url}${fullCacheBuster}`;
              
            const result = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
            return result;
          } catch (error) {
            console.error('خطأ في المزامنة مع المصدر الخارجي المحفوظ:', error);
          }
        }
        
        // استخدام البيانات المحلية كحل أخير
        console.log('فشلت المزامنة مع المصادر الخارجية، استخدام البيانات المحلية');
        const result = await syncWithLocalData(forceRefresh);
        return result;
      } catch (error) {
        console.error('خطأ أثناء المزامنة:', error);
        
        // محاولة استخدام البيانات المحلية في حالة الفشل
        try {
          console.log('محاولة استخدام البيانات المحلية بعد فشل المزامنة الخارجية');
          return await syncWithLocalData(false);
        } catch (localError) {
          console.error('فشل في استخدام البيانات المحلية:', localError);
          return false;
        }
      }
    })();
    
    // تنفيذ المزامنة مع مهلة زمنية
    const result = await Promise.race([syncPromise, timeoutPromise]);
    return result;
    
  } catch (error) {
    console.error('خطأ غير متوقع أثناء المزامنة:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الخطأ
    try {
      return await syncWithLocalData(false);
    } catch (e) {
      console.error('فشل الرجوع للبيانات المحلية:', e);
      return false;
    }
  } finally {
    // تحرير قفل المزامنة دائمًا حتى في حالة الخطأ
    releaseSyncLock();
    setIsSyncing(false);
  }
};

// دالة للتحقق وإجراء المزامنة الأولية عند بدء التطبيق
export const performInitialSync = async (): Promise<boolean> => {
  const { isSyncNeeded } = await import('./local');
  
  try {
    console.log('بدء المزامنة الأولية...');
    const needsSync = isSyncNeeded();
    
    if (needsSync) {
      console.log('التطبيق يحتاج إلى مزامنة البيانات');
      // محاولة مزامنة مع مواقع Bladi Info أولاً
      try {
        const bladiResult = await syncWithBladiInfo(false);
        if (bladiResult) {
          console.log('تمت المزامنة بنجاح مع مواقع Bladi Info');
          return true;
        }
      } catch (error) {
        console.error('فشلت المزامنة مع مواقع Bladi Info:', error);
      }
    }
    
    // إذا لم تكن هناك حاجة للمزامنة أو فشلت المزامنة مع المواقع، استخدم المزامنة العادية
    return await syncAllData();
  } catch (error) {
    console.error('فشلت المزامنة الأولية:', error);
    
    // في حالة الفشل، استخدم البيانات المحلية على أي حال
    try {
      await syncWithLocalData(false);
      return true;
    } catch (e) {
      console.error('فشل الرجوع إلى البيانات المحلية:', e);
      return false;
    }
  }
};
