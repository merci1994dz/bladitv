import { setSyncActive } from '../status';
import { setSyncError, clearSyncError } from '../status/errorHandling';
import { setSyncTimestamp } from '../status/timestamp';
import { setIsSyncing } from '../../dataStore';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from '../lock';
import { getSkewProtectionParams } from '../remote/sync/index';
import { BLADI_INFO_SOURCES } from '../remote/sync/sources';
import { syncState, resetConsecutiveAttempts, MAX_CONSECUTIVE_SYNCS } from './syncState';
import { executeSync } from './helpers/syncExecutor';
import { isCooldownComplete, calculateAdaptiveWaitTime, createTimeoutPromise } from './helpers/timeoutHelper';
import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';
export { performInitialSync } from './initialSync';

export const performSync = async (
  options: {
    source?: string;
    forceRefresh?: boolean;
    showNotifications?: boolean;
    onComplete?: (success: boolean) => void;
  } = {}
): Promise<boolean> => {
  const { 
    source = 'all', 
    forceRefresh = false, 
    showNotifications = true,
    onComplete 
  } = options;

  try {
    setSyncActive(true);
    const result = true;

    if (result) {
      setSyncTimestamp();
      clearSyncError();
    }

    if (onComplete) {
      onComplete(result);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setSyncError(errorMessage);
    console.error('Error in core sync operation:', error);
    
    if (onComplete) {
      onComplete(false);
    }

    return false;
  } finally {
    setSyncActive(false);
  }
};

export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  if (syncState.syncInProgress) {
    console.warn('هناك مزامنة قيد التنفيذ بالفعل، تجنب المحاولة المتزامنة');
    return false;
  }
  
  resetConsecutiveAttempts();
  const now = Date.now();
  if (!isCooldownComplete(syncState.lastSyncAttemptTime, syncState.cooldownPeriodMs)) {
    syncState.consecutiveSyncAttempts++;
    if (syncState.consecutiveSyncAttempts > MAX_CONSECUTIVE_SYNCS) {
      console.warn(`تم تجاوز الحد الأقصى لمحاولات المزامنة المتتالية (${MAX_CONSECUTIVE_SYNCS})، تجاهل هذه المحاولة`);
      
      syncState.cooldownPeriodMs = Math.min(syncState.cooldownPeriodMs * 1.5, 30000);
      console.log(`تم زيادة فترة الانتظار إلى ${syncState.cooldownPeriodMs}ms`);
      
      return false;
    }
  } else {
    syncState.consecutiveSyncAttempts = 1;
    if (syncState.cooldownPeriodMs > 5000) {
      syncState.cooldownPeriodMs = Math.max(5000, syncState.cooldownPeriodMs * 0.8);
    }
  }
  
  syncState.lastSyncAttemptTime = now;
  syncState.totalSyncAttempts++;
  
  if (isSyncLocked()) {
    console.log('المزامنة قيد التنفيذ بالفعل، إضافة الطلب إلى الطابور / Sync already in progress, adding request to queue');
    return addToSyncQueue(() => syncAllData(forceRefresh || true));
  }
  
  syncState.syncInProgress = true;
  setSyncLock('sync-all-data');
  setIsSyncing(true);
  setSyncActive(true);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري = / Starting sync process, force mode =', forceRefresh);
    const skewParam = getSkewProtectionParams();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const cacheBuster = `?_=${timestamp}&nocache=${randomId}`;
    const fullCacheBuster = skewParam ? `${cacheBuster}&${skewParam}` : cacheBuster;
    const timeoutPromise = createTimeoutPromise(20000);
    
    console.log('التحقق من وجود مصدر متاح للمزامنة... / Checking for available sync source...');
    let availableSource = await checkBladiInfoAvailability();
    
    if (availableSource && availableSource.startsWith('/')) {
      console.log('المصدر المتاح هو مصدر محلي، محاولة العثور على مصدر خارجي بدلاً من ذلك');
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
    
    const syncPromise = executeSync(availableSource, forceRefresh || true);
    const result = await Promise.race([syncPromise, timeoutPromise]);
    
    if (result) {
      syncState.consecutiveSyncAttempts = 0;
      syncState.failedAttempts = 0;
      syncState.lastSuccessfulSync = Date.now();
      
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
      syncState.failedAttempts++;
      console.warn(`فشلت جميع محاولات المزامنة مع المصادر الخارجية (المحاولة ${syncState.failedAttempts})`);
      
      try {
        localStorage.setItem('last_sync_success', 'false');
        localStorage.setItem('last_sync_failure', Date.now().toString());
      } catch (e) {
        console.error('فشل في تعيين علامات فشل المزامنة', e);
      }
      
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
    releaseSyncLock('sync-all-data');
    setIsSyncing(false);
    setSyncActive(false);
    syncState.syncInProgress = false;
  }
};
