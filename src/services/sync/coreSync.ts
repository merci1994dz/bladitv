
import { REMOTE_CONFIG, STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { getRemoteConfig } from './remote';
import { syncWithRemoteSource, syncWithBladiInfo, getSkewProtectionParams, checkBladiInfoAvailability } from './remoteSync';
import { syncWithLocalData } from './local';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from './syncLock';
import { setSyncActive } from './status';

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
  setSyncActive(true);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري =', forceRefresh);
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting) مع دعم حماية التزامن
    const skewParam = getSkewProtectionParams();
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    const fullCacheBuster = skewParam ? `${cacheBuster}&${skewParam}` : cacheBuster;
    
    // تحديد مهلة زمنية للمزامنة لمنع التعليق إلى ما لا نهاية - زيادة إلى 60 ثانية
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('تم تجاوز الوقت المخصص للمزامنة');
        resolve(false);
      }, 60000); // زيادة المهلة إلى 60 ثانية
    });
    
    // التحقق من وجود مصدر متاح
    console.log('التحقق من وجود مصدر متاح للمزامنة...');
    const availableSource = await checkBladiInfoAvailability();
    if (availableSource) {
      console.log(`تم العثور على مصدر متاح: ${availableSource}`);
    } else {
      console.warn('لم يتم العثور على أي مصدر متاح، سيتم استخدام الخطة البديلة');
    }
    
    // محاولة المزامنة مع مواقع Bladi Info أولاً
    const syncPromise = (async () => {
      try {
        // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
        if (availableSource) {
          try {
            console.log(`محاولة المزامنة مع المصدر المتاح: ${availableSource}`);
            const directResult = await syncWithRemoteSource(availableSource, forceRefresh);
            if (directResult) {
              console.log(`تمت المزامنة بنجاح مع المصدر المتاح: ${availableSource}`);
              return true;
            }
            console.warn(`فشلت المزامنة مع المصدر المتاح ${availableSource}`);
          } catch (error) {
            console.error(`فشلت المزامنة مع المصدر المتاح ${availableSource}:`, error);
          }
        }
        
        // محاولة المزامنة مع جميع مصادر Bladi Info
        console.log('محاولة المزامنة مع جميع مصادر Bladi Info...');
        const bladiInfoResult = await syncWithBladiInfo(forceRefresh);
        if (bladiInfoResult) {
          console.log('تمت المزامنة بنجاح مع مصادر Bladi Info');
          return true;
        }
        console.warn('فشلت المزامنة مع جميع مصادر Bladi Info');
        
        // التحقق من وجود تكوين خارجي
        const remoteConfig = getRemoteConfig();
        if (REMOTE_CONFIG.ENABLED && remoteConfig && remoteConfig.url) {
          try {
            console.log(`محاولة المزامنة مع المصدر المحفوظ: ${remoteConfig.url}`);
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
    setSyncActive(false);
  }
};

// دالة للتحقق وإجراء المزامنة الأولية عند بدء التطبيق
export const performInitialSync = async (): Promise<boolean> => {
  const { isSyncNeeded } = await import('./local');
  
  try {
    console.log('بدء المزامنة الأولية...');
    const needsSync = isSyncNeeded();
    
    // تحديد حالة المزامنة على نشطة أثناء المزامنة الأولية
    setSyncActive(true);
    
    // التحقق من وجود مصدر متاح
    console.log('التحقق من وجود مصدر متاح للمزامنة الأولية...');
    const availableSource = await checkBladiInfoAvailability();
    
    if (needsSync) {
      console.log('التطبيق يحتاج إلى مزامنة البيانات');
      
      // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
      if (availableSource) {
        try {
          console.log(`محاولة المزامنة مع المصدر المتاح: ${availableSource}`);
          const directResult = await syncWithRemoteSource(availableSource, false);
          if (directResult) {
            console.log(`تمت المزامنة بنجاح مع المصدر المتاح: ${availableSource}`);
            return true;
          }
        } catch (error) {
          console.error(`فشلت المزامنة مع المصدر المتاح ${availableSource}:`, error);
        }
      }
      
      // محاولة مزامنة مع مواقع Bladi Info أولاً
      try {
        console.log('محاولة المزامنة مع مواقع Bladi Info...');
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
  } finally {
    // إعادة تعيين حالة المزامنة
    setSyncActive(false);
  }
};
