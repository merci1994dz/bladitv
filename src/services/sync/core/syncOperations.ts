/**
 * وظيفة المزامنة الرئيسية - محسنة مع آلية قفل آمنة ومعالجة الطوابير
 * Main synchronization function - enhanced with safe locking mechanism and queue handling
 */

import { setIsSyncing } from '../../dataStore';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from '../lock';
import { setSyncActive } from '../status';
import { getSkewProtectionParams } from '../remote/sync/index';
import { BLADI_INFO_SOURCES } from '../remote/sync/sources';
import { syncState, resetConsecutiveAttempts, MAX_CONSECUTIVE_SYNCS } from './syncState';
import { executeSync } from './helpers/syncExecutor';
import { isCooldownComplete, calculateAdaptiveWaitTime, createTimeoutPromise } from './helpers/timeoutHelper';
import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';

// Re-export the performInitialSync function from initialSync.ts
export { performInitialSync } from './initialSync';

/**
 * وظيفة المزامنة الرئيسية - محسنة مع آلية قفل آمنة ومعالجة الطوابير
 * Main synchronization function - enhanced with safe locking mechanism and queue handling
 */
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  // منع تشغيل المزامنات المتوازية
  if (syncState.syncInProgress) {
    console.warn('هناك مزامنة قيد التنفيذ بالفعل، تجنب المحاولة المتزامنة');
    return false;
  }
  
  // إعادة تعيين العداد بناءً على الوقت المنقضي منذ آخر محاولة
  resetConsecutiveAttempts();
  
  // فحص عدد المحاولات المتتالية لمنع تكرار المزامنة بشكل مفرط
  // Check consecutive attempts to prevent excessive syncing
  const now = Date.now();
  if (!isCooldownComplete(syncState.lastSyncAttemptTime, syncState.cooldownPeriodMs)) {
    syncState.consecutiveSyncAttempts++;
    if (syncState.consecutiveSyncAttempts > MAX_CONSECUTIVE_SYNCS) {
      console.warn(`تم تجاوز الحد الأقصى لمحاولات المزامنة المتتالية (${MAX_CONSECUTIVE_SYNCS})، تجاهل هذه المحاولة`);
      
      // زيادة فترة الانتظار تدريجياً مع كل تجاوز للحد الأقصى
      syncState.cooldownPeriodMs = Math.min(syncState.cooldownPeriodMs * 1.5, 30000);
      console.log(`تم زيادة فترة الانتظار إلى ${syncState.cooldownPeriodMs}ms`);
      
      return false;
    }
  } else {
    // إعادة تعيين العداد إذا مرت فترة كافية
    syncState.consecutiveSyncAttempts = 1;
    
    // استعادة فترة الانتظار الأساسية تدريجياً
    if (syncState.cooldownPeriodMs > 5000) {
      syncState.cooldownPeriodMs = Math.max(5000, syncState.cooldownPeriodMs * 0.8);
    }
  }
  
  // تحديث وقت آخر محاولة وزيادة العدد الإجمالي للمحاولات
  syncState.lastSyncAttemptTime = now;
  syncState.totalSyncAttempts++;
  
  // إذا كانت المزامنة قيد التنفيذ، إضافة الطلب إلى الطابور
  // If synchronization is already in progress, add the request to the queue
  if (isSyncLocked()) {
    console.log('المزامنة قيد التنفيذ بالفعل، إضافة الطلب إلى الطابور / Sync already in progress, adding request to queue');
    
    // إضافة الوظيفة إلى الطابور (إعادة استدعاء النفس)
    // Add function to queue (calling itself)
    return addToSyncQueue(() => syncAllData(forceRefresh || true)); // دائمًا استخدم forceRefresh=true في الطابور
  }
  
  // تعيين علامة المزامنة قيد التقدم
  syncState.syncInProgress = true;
  
  // وضع قفل المزامنة
  // Set sync lock
  setSyncLock('sync-all-data');
  setIsSyncing(true);
  setSyncActive(true);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري = / Starting sync process, force mode =', forceRefresh);
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting) مع دعم حماية التزامن
    // Add cache-busting parameter with sync protection support
    const skewParam = getSkewProtectionParams();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const cacheBuster = `?_=${timestamp}&nocache=${randomId}`;
    const fullCacheBuster = skewParam ? `${cacheBuster}&${skewParam}` : cacheBuster;
    
    // تحديد مهلة زمنية للمزامنة لمنع التعليق إلى ما لا نهاية - تقليل من 30 ثانية إلى 20 ثانية
    // Set timeout for sync to prevent hanging indefinitely - decreased from 30 to 20 seconds
    const timeoutPromise = createTimeoutPromise(20000);
    
    // التحقق من وجود مصدر متاح
    // Check for available source
    console.log('التحقق من وجود مصدر متاح للمزامنة... / Checking for available sync source...');
    let availableSource = await checkBladiInfoAvailability();
    
    // إذا كان المصدر المتاح هو المصدر المحلي، تجاوزه واختيار مصدر آخر
    if (availableSource && availableSource.startsWith('/')) {
      console.log('المصدر المتاح هو مصدر محلي، محاولة العثور على مصدر خارجي بدلاً من ذلك');
      
      // محاولة العثور على مصدر خارجي متاح
      for (const source of BLADI_INFO_SOURCES) {
        if (!source.startsWith('/')) {
          try {
            const { isRemoteUrlAccessible } = await import('../remote/fetch');
            const isAccessible = await isRemoteUrlAccessible(source);
            
            if (isAccessible) {
              availableSource = source;
              console.log(`تم العثور على مصدر خارجي متاح: ${source}`);
              break;
            }
          } catch (error) {
            console.warn(`فشل فحص إمكانية الوصول إلى ${source}:`, error);
          }
        }
      }
    }
    
    if (availableSource) {
      console.log(`تم العثور على مصدر متاح: / Found available source: ${availableSource}`);
    } else {
      console.warn('لم يتم العثور على أي مصدر متاح، سيتم محاولة جميع المصادر الخارجية / No available source found, will try all external sources');
    }
    
    // محاولة المزامنة مع مصدر Bladi Info
    // Try to sync with Bladi Info source
    const syncPromise = executeSync(availableSource, forceRefresh || true, fullCacheBuster);
    
    // تنفيذ المزامنة مع مهلة زمنية
    // Execute sync with timeout
    const result = await Promise.race([syncPromise, timeoutPromise]);
    
    // تحديث حالة المزامنة بناءً على النتيجة
    if (result) {
      // تم النجاح
      syncState.consecutiveSyncAttempts = 0;
      syncState.failedAttempts = 0;
      syncState.lastSuccessfulSync = Date.now();
      
      // إضافة علامة للتحديث الإجباري في التخزين المحلي
      // Add a forced refresh flag in local storage
      try {
        localStorage.setItem('force_browser_refresh', 'true');
        localStorage.setItem('nocache_version', Date.now().toString());
        localStorage.setItem('data_version', Date.now().toString());
        localStorage.setItem('last_sync_success', 'true');
        localStorage.setItem('last_sync_time', new Date().toISOString());
      } catch (e) {
        console.error('فشل في تعيين علامات التحديث', e);
      }
      
      return true;
    } else {
      // حالة فشل المزامنة
      syncState.failedAttempts++;
      console.warn(`فشلت جميع محاولات المزامنة مع المصادر الخارجية (المحاولة ${syncState.failedAttempts})`);
      
      // تعيين علامات فشل المزامنة
      try {
        localStorage.setItem('last_sync_success', 'false');
        localStorage.setItem('last_sync_failure', Date.now().toString());
      } catch (e) {
        console.error('فشل في تعيين علامات فشل المزامنة', e);
      }
      
      // الانتظار لفترة متزايدة قبل السماح بمحاولة أخرى
      const waitTime = calculateAdaptiveWaitTime(syncState.failedAttempts);
      console.log(`تعيين فترة انتظار ${waitTime}ms قبل السماح بمحاولة مزامنة أخرى`);
      syncState.cooldownPeriodMs = waitTime;
      
      return false;
    }
    
  } catch (error) {
    console.error('خطأ غير متوقع أثناء المزامنة: / Unexpected error during sync:', error);
    syncState.failedAttempts++;
    return false;
  } finally {
    // تحرير قفل المزامنة دائمًا حتى في حالة الخطأ
    // Always release sync lock even in case of error
    releaseSyncLock('sync-all-data');
    setIsSyncing(false);
    setSyncActive(false);
    syncState.syncInProgress = false;
  }
};
