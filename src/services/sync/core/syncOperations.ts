
import { REMOTE_CONFIG } from '../../config';
import { setIsSyncing } from '../../dataStore';
import { getRemoteConfig } from '../remote';
import { 
  syncWithRemoteSource, 
  syncWithBladiInfo, 
  checkBladiInfoAvailability,
  getSkewProtectionParams
} from '../remoteSync';
import { syncWithLocalData } from '../local';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from '../syncLock';
import { setSyncActive } from '../status';
import { initializeSyncProcess } from './initialization';

/**
 * وظيفة المزامنة الرئيسية - محسنة مع آلية قفل آمنة ومعالجة الطوابير
 * Main synchronization function - enhanced with safe locking mechanism and queue handling
 */
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  // إذا كانت المزامنة قيد التنفيذ، إضافة الطلب إلى الطابور
  // If synchronization is already in progress, add the request to the queue
  if (isSyncLocked()) {
    console.log('المزامنة قيد التنفيذ بالفعل، إضافة الطلب إلى الطابور / Sync already in progress, adding request to queue');
    
    // إضافة الوظيفة إلى الطابور (إعادة استدعاء النفس)
    // Add function to queue (calling itself)
    return addToSyncQueue(() => syncAllData(forceRefresh));
  }
  
  // وضع قفل المزامنة
  // Set sync lock
  setSyncLock();
  setIsSyncing(true);
  setSyncActive(true);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري = / Starting sync process, force mode =', forceRefresh);
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting) مع دعم حماية التزامن
    // Add cache-busting parameter with sync protection support
    const skewParam = getSkewProtectionParams();
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    const fullCacheBuster = skewParam ? `${cacheBuster}&${skewParam}` : cacheBuster;
    
    // تحديد مهلة زمنية للمزامنة لمنع التعليق إلى ما لا نهاية - زيادة إلى 60 ثانية
    // Set timeout for sync to prevent hanging indefinitely - increased to 60 seconds
    const timeoutPromise = createTimeoutPromise(60000);
    
    // التحقق من وجود مصدر متاح
    // Check for available source
    console.log('التحقق من وجود مصدر متاح للمزامنة... / Checking for available sync source...');
    const availableSource = await checkBladiInfoAvailability();
    if (availableSource) {
      console.log(`تم العثور على مصدر متاح: / Found available source: ${availableSource}`);
    } else {
      console.warn('لم يتم العثور على أي مصدر متاح، سيتم استخدام الخطة البديلة / No available source found, will use fallback plan');
    }
    
    // محاولة المزامنة مع مواقع Bladi Info أولاً
    // Try to sync with Bladi Info sites first
    const syncPromise = executeSync(availableSource, forceRefresh, fullCacheBuster, skewParam);
    
    // تنفيذ المزامنة مع مهلة زمنية
    // Execute sync with timeout
    const result = await Promise.race([syncPromise, timeoutPromise]);
    return result;
    
  } catch (error) {
    console.error('خطأ غير متوقع أثناء المزامنة: / Unexpected error during sync:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الخطأ
    // Try to use local data in case of error
    try {
      return await syncWithLocalData(false);
    } catch (e) {
      console.error('فشل الرجوع للبيانات المحلية: / Failed to fallback to local data:', e);
      return false;
    }
  } finally {
    // تحرير قفل المزامنة دائمًا حتى في حالة الخطأ
    // Always release sync lock even in case of error
    releaseSyncLock();
    setIsSyncing(false);
    setSyncActive(false);
  }
};

/**
 * دالة لتنفيذ المزامنة مع المصادر المختلفة
 * Function to execute sync with different sources
 */
async function executeSync(
  availableSource: string | null, 
  forceRefresh: boolean,
  fullCacheBuster: string,
  skewParam: string | null
): Promise<boolean> {
  try {
    // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
    // Try to sync with available source directly if found
    if (availableSource) {
      try {
        console.log(`محاولة المزامنة مع المصدر المتاح: / Attempting to sync with available source: ${availableSource}`);
        const directResult = await syncWithRemoteSource(availableSource, forceRefresh);
        if (directResult) {
          console.log(`تمت المزامنة بنجاح مع المصدر المتاح: / Successfully synced with available source: ${availableSource}`);
          return true;
        }
        console.warn(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}`);
      } catch (error) {
        console.error(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}:`, error);
      }
    }
    
    // محاولة المزامنة مع جميع مصادر Bladi Info
    // Try to sync with all Bladi Info sources
    console.log('محاولة المزامنة مع جميع مصادر Bladi Info... / Attempting to sync with all Bladi Info sources...');
    const bladiInfoResult = await syncWithBladiInfo(forceRefresh);
    if (bladiInfoResult) {
      console.log('تمت المزامنة بنجاح مع مصادر Bladi Info / Successfully synced with Bladi Info sources');
      return true;
    }
    console.warn('فشلت المزامنة مع جميع مصادر Bladi Info / Failed to sync with all Bladi Info sources');
    
    // التحقق من وجود تكوين خارجي
    // Check for external configuration
    const remoteConfig = getRemoteConfig();
    if (REMOTE_CONFIG.ENABLED && remoteConfig && remoteConfig.url) {
      try {
        console.log(`محاولة المزامنة مع المصدر المحفوظ: / Attempting to sync with saved source: ${remoteConfig.url}`);
        // إضافة معامل كسر التخزين المؤقت للرابط مع دعم حماية التزامن
        // Add cache-busting parameter to URL with sync protection support
        const urlWithCacheBuster = remoteConfig.url.includes('?') 
          ? `${remoteConfig.url}&_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}${skewParam ? `&${skewParam}` : ''}` 
          : `${remoteConfig.url}${fullCacheBuster}`;
          
        const result = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        return result;
      } catch (error) {
        console.error('خطأ في المزامنة مع المصدر الخارجي المحفوظ: / Error syncing with saved external source:', error);
      }
    }
    
    // استخدام البيانات المحلية كحل أخير
    // Use local data as last resort
    console.log('فشلت المزامنة مع المصادر الخارجية، استخدام البيانات المحلية / Failed to sync with external sources, using local data');
    const result = await syncWithLocalData(forceRefresh);
    return result;
  } catch (error) {
    console.error('خطأ أثناء المزامنة: / Error during sync:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الفشل
    // Try to use local data in case of failure
    try {
      console.log('محاولة استخدام البيانات المحلية بعد فشل المزامنة الخارجية / Attempting to use local data after external sync failure');
      return await syncWithLocalData(false);
    } catch (localError) {
      console.error('فشل في استخدام البيانات المحلية: / Failed to use local data:', localError);
      return false;
    }
  }
}

/**
 * إنشاء وعد مهلة زمنية
 * Create timeout promise
 */
function createTimeoutPromise(timeout: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn('تم تجاوز الوقت المخصص للمزامنة / Sync timeout exceeded');
      resolve(false);
    }, timeout);
  });
}

/**
 * دالة للتحقق وإجراء المزامنة الأولية عند بدء التطبيق
 * Function to check and perform initial sync at application startup
 */
export const performInitialSync = async (): Promise<boolean> => {
  const { isSyncNeeded } = await import('../local');
  
  try {
    console.log('بدء المزامنة الأولية... / Starting initial sync...');
    const needsSync = isSyncNeeded();
    
    // تحديد حالة المزامنة على نشطة أثناء المزامنة الأولية
    // Set sync state to active during initial sync
    setSyncActive(true);
    
    // التحقق من وجود مصدر متاح
    // Check for available source
    console.log('التحقق من وجود مصدر متاح للمزامنة الأولية... / Checking for available source for initial sync...');
    const availableSource = await checkBladiInfoAvailability();
    
    if (needsSync) {
      console.log('التطبيق يحتاج إلى مزامنة البيانات / Application needs data sync');
      
      // محاولة المزامنة مع المصدر المتاح مباشرة إذا وجد
      // Try to sync with available source directly if found
      if (availableSource) {
        try {
          console.log(`محاولة المزامنة مع المصدر المتاح: / Attempting to sync with available source: ${availableSource}`);
          const directResult = await syncWithRemoteSource(availableSource, false);
          if (directResult) {
            console.log(`تمت المزامنة بنجاح مع المصدر المتاح: / Successfully synced with available source: ${availableSource}`);
            return true;
          }
        } catch (error) {
          console.error(`فشلت المزامنة مع المصدر المتاح / Failed to sync with available source ${availableSource}:`, error);
        }
      }
      
      // محاولة مزامنة مع مواقع Bladi Info أولاً
      // Try to sync with Bladi Info sites first
      try {
        console.log('محاولة المزامنة مع مواقع Bladi Info... / Attempting to sync with Bladi Info sites...');
        const bladiResult = await syncWithBladiInfo(false);
        if (bladiResult) {
          console.log('تمت المزامنة بنجاح مع مواقع Bladi Info / Successfully synced with Bladi Info sites');
          return true;
        }
      } catch (error) {
        console.error('فشلت المزامنة مع مواقع Bladi Info: / Failed to sync with Bladi Info sites:', error);
      }
    }
    
    // إذا لم تكن هناك حاجة للمزامنة أو فشلت المزامنة مع المواقع، استخدم المزامنة العادية
    // If no sync needed or failed to sync with sites, use regular sync
    return await syncAllData();
  } catch (error) {
    console.error('فشلت المزامنة الأولية: / Initial sync failed:', error);
    
    // في حالة الفشل، استخدم البيانات المحلية على أي حال
    // In case of failure, use local data anyway
    try {
      await syncWithLocalData(false);
      return true;
    } catch (e) {
      console.error('فشل الرجوع إلى البيانات المحلية: / Failed to fall back to local data:', e);
      return false;
    }
  } finally {
    // إعادة تعيين حالة المزامنة
    // Reset sync state
    setSyncActive(false);
  }
};
