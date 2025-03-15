
import { REMOTE_CONFIG } from '../config';
import { isSyncing, setIsSyncing, saveChannelsToStorage } from '../dataStore';
import { getRemoteConfig, setRemoteConfig, syncWithRemoteSource } from './remote';
import { syncWithLocalData, getLastSyncTime, isSyncNeeded, forceSync, obfuscateStreamUrls, syncWithRemoteAPI } from './local';
import { setupAutoSync } from './auto';

// Main export of sync functions
export { 
  getLastSyncTime, 
  isSyncNeeded,
  syncWithRemoteAPI,
  forceSync,
  obfuscateStreamUrls
} from './local';

export { 
  getRemoteConfig, 
  setRemoteConfig,
  syncWithRemoteSource 
} from './remote';

export { setupAutoSync } from './auto';

// Main sync function - Improved with better caching control and guaranteed refresh
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  if (isSyncing) {
    console.log('المزامنة قيد التنفيذ بالفعل');
    return false;
  }
  
  try {
    setIsSyncing(true);
    
    // Add cache-busting parameter with random value to avoid browser caching
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    
    // Check for remote config
    const remoteConfigStr = localStorage.getItem('tv_remote_config');
    if (REMOTE_CONFIG.ENABLED && remoteConfigStr) {
      try {
        const remoteConfig = JSON.parse(remoteConfigStr);
        if (remoteConfig && remoteConfig.url) {
          // Add cache-busting to the URL
          const urlWithCacheBuster = remoteConfig.url.includes('?') 
            ? `${remoteConfig.url}&_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}` 
            : `${remoteConfig.url}${cacheBuster}`;
            
          return await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        }
      } catch (error) {
        console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
      }
    }
    
    // If no remote source or sync failed, use local data
    return await syncWithLocalData(forceRefresh);
  } finally {
    setIsSyncing(false);
  }
};

// Force refresh function - enhanced to ensure all data is refreshed
export const forceDataRefresh = async (): Promise<boolean> => {
  // Clear channel data from localStorage to force a refresh
  localStorage.removeItem('last_sync_time');
  localStorage.removeItem('last_sync');
  
  // Force reload of cached data
  localStorage.setItem('force_refresh', Date.now().toString());
  
  // Trigger a save of current channels to ensure they're included in local storage
  saveChannelsToStorage();
  
  // Force the refresh
  const success = await syncAllData(true);
  
  // Add a special flag for bladi-info.com to detect changes
  localStorage.setItem('bladi_info_update', Date.now().toString());
  
  // Force page reload to show new data
  if (success) {
    // إضافة تأخير أطول لضمان اكتمال المزامنة
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
  
  return success;
};

// Export sync status check function
export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

// Add function to check and perform initial sync on application startup
export const performInitialSync = (): void => {
  if (isSyncNeeded()) {
    syncAllData().catch(error => {
      console.error('Initial sync failed:', error);
    });
  }
};

// Ensure channels are visible to all users - improved function
export const publishChannelsToAllUsers = async (): Promise<boolean> => {
  console.log('نشر القنوات لجميع المستخدمين...');
  
  try {
    // 1. الخطوة الأولى: حفظ القنوات في التخزين المحلي
    const saveResult = saveChannelsToStorage();
    if (!saveResult) {
      throw new Error('فشل في حفظ القنوات إلى التخزين المحلي');
    }
    
    // 2. إضافة علامة زمنية للتأكد من أن كل المستخدمين سيرون البيانات المحدثة
    localStorage.setItem('data_version', Date.now().toString());
    localStorage.setItem('bladi_info_update', Date.now().toString());
    
    // 3. إضافة علامات خاصة لـ bladi-info.com
    localStorage.setItem('bladi_update_version', Date.now().toString());
    localStorage.setItem('bladi_update_channels', 'true');
    localStorage.setItem('bladi_force_refresh', 'true');
    
    // 4. تطبيق المزامنة القسرية - مع إعادة التحميل المتأخرة
    const syncResult = await forceDataRefresh();
    
    // تسجيل النتيجة
    console.log('نتيجة النشر للمستخدمين:', { saveResult, syncResult });
    
    return syncResult;
  } catch (error) {
    console.error('فشل في نشر القنوات للمستخدمين:', error);
    return false;
  }
};

// Initialize sync on application startup (only if needed)
performInitialSync();
