
import { REMOTE_CONFIG, STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { getRemoteConfig } from './remote';
import { syncWithRemoteSource, syncWithBladiInfo } from './remoteSync';
import { syncWithLocalData } from './local';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from './syncLock';

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
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting)
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    
    // محاولة المزامنة مع مواقع Bladi Info أولاً
    const bladiInfoResult = await syncWithBladiInfo(forceRefresh);
    if (bladiInfoResult) {
      return true;
    }
    
    // التحقق من وجود تكوين خارجي
    const remoteConfig = getRemoteConfig();
    if (REMOTE_CONFIG.ENABLED && remoteConfig && remoteConfig.url) {
      try {
        // إضافة معامل كسر التخزين المؤقت للرابط
        const urlWithCacheBuster = remoteConfig.url.includes('?') 
          ? `${remoteConfig.url}&_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}` 
          : `${remoteConfig.url}${cacheBuster}`;
          
        const result = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        return result;
      } catch (error) {
        console.error('خطأ في المزامنة مع المصدر الخارجي المحفوظ:', error);
      }
    }
    
    // إذا لم يكن هناك مصدر خارجي أو فشلت المزامنة، استخدم البيانات المحلية
    const result = await syncWithLocalData(forceRefresh);
    return result;
  } catch (error) {
    console.error('خطأ أثناء المزامنة:', error);
    return false;
  } finally {
    // تحرير قفل المزامنة
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
    return false;
  }
};
