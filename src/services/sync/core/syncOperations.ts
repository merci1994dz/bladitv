
/**
 * وظيفة المزامنة الرئيسية - محسنة مع آلية قفل آمنة ومعالجة الطوابير
 * Main synchronization function - enhanced with safe locking mechanism and queue handling
 */

import { setIsSyncing } from '../../dataStore';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from '../lock';
import { setSyncActive } from '../status';
import { getSkewProtectionParams } from '../remoteSync';
import { checkBladiInfoAvailability } from '../remoteSync';
import { createTimeoutPromise } from './helpers/timeoutHelper';
import { executeSync } from './helpers/syncExecutor';
import { syncWithLocalData } from '../local';
import { toast } from '@/hooks/use-toast';

// Re-export the performInitialSync function from initialSync.ts
export { performInitialSync } from './initialSync';

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
    return addToSyncQueue(() => syncAllData(forceRefresh || true)); // دائمًا استخدم forceRefresh=true في الطابور
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
    
    // تحديد مهلة زمنية للمزامنة لمنع التعليق إلى ما لا نهاية - زيادة إلى 120 ثانية
    // Set timeout for sync to prevent hanging indefinitely - increased to 120 seconds
    const timeoutPromise = createTimeoutPromise(120000);
    
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
    try {
      const syncPromise = executeSync(availableSource, forceRefresh || true, fullCacheBuster, skewParam); // دائمًا استخدم forceRefresh=true
      
      // تنفيذ المزامنة مع مهلة زمنية
      // Execute sync with timeout
      const result = await Promise.race([syncPromise, timeoutPromise]);
      
      // إضافة علامة للتحديث الإجباري في التخزين المحلي
      // Add a forced refresh flag in local storage
      if (result) {
        try {
          localStorage.setItem('force_browser_refresh', 'true');
          localStorage.setItem('nocache_version', Date.now().toString());
          localStorage.setItem('data_version', Date.now().toString());
        } catch (e) {
          console.error('فشل في تعيين علامات التحديث', e);
        }
        
        return result;
      } else {
        // المزامنة فشلت، محاولة استخدام البيانات المحلية
        throw new Error('Remote sync failed, falling back to local data');
      }
    } catch (error) {
      console.error('خطأ أثناء المزامنة: / Error during sync:', error);
      
      // محاولة استخدام البيانات المحلية عند فشل المزامنة
      console.log('محاولة استخدام البيانات المحلية... / Trying to use local data...');
      return await syncWithLocalData(forceRefresh || true);
    }
    
  } catch (error) {
    console.error('خطأ غير متوقع أثناء المزامنة: / Unexpected error during sync:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الخطأ
    // Try to use local data in case of error
    try {
      console.log('خطأ المزامنة، استخدام البيانات المحلية... / Sync error, using local data...');
      return await syncWithLocalData(forceRefresh || true); // دائمًا استخدم forceRefresh=true
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
