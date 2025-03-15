
import { STORAGE_KEYS, SECURITY_CONFIG, VIDEO_PLAYER } from '../config';
import { channels, countries, categories, setIsSyncing, loadFromLocalStorage } from '../dataStore';
import { updateLastSyncTime } from './config';

// Data obfuscation function for security
export function obfuscateStreamUrls(data: any[]): any[] {
  if (!VIDEO_PLAYER.OBFUSCATE_SOURCE) return data;
  
  return data.map(item => {
    if (item.streamUrl) {
      // Create a deep copy to avoid modifying the original object
      const secureItem = {...item};
      
      // Store original URL in memory but create a protected reference for display
      const originalUrl = secureItem.streamUrl;
      
      // Replace with a protected placeholder for display purposes
      Object.defineProperty(secureItem, '_secureStreamUrl', {
        value: originalUrl,
        enumerable: false,
        writable: false,
        configurable: false
      });
      
      // Replace the publicly visible URL with a secure proxy or placeholder
      secureItem.streamUrl = VIDEO_PLAYER.USE_PROXY 
        ? `proxy://${btoa(originalUrl).substring(0, 10)}...`
        : `protected://${btoa(originalUrl.split('/')[2] || 'stream').substring(0, 8)}`;
      
      return secureItem;
    }
    return item;
  });
}

// Function that works with local data - improved to handle forced refresh
export const syncWithLocalData = async (forceRefresh = false): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('استخدام البيانات المحلية للمزامنة');
    
    if (forceRefresh) {
      // Reload data from localStorage
      loadFromLocalStorage();
      console.log('إعادة تحميل البيانات المحلية بشكل إجباري');
    }
    
    // إضافة طابع زمني لمنع التخزين المؤقت
    const timestamp = Date.now().toString();
    
    // Simply save current data to localStorage with timestamp
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // إضافة علامات تحديث خاصة لضمان تحديث جميع المتصفحات
    localStorage.setItem('data_update_timestamp', timestamp);
    localStorage.setItem('sync_complete_time', timestamp);
    localStorage.setItem('force_browser_refresh', forceRefresh ? 'true' : 'false');
    
    // Update last sync time
    updateLastSyncTime();
    
    console.log('تم حفظ البيانات المحلية بنجاح');
    
    // If this was a forced refresh, reload the page
    if (forceRefresh) {
      // تأخير قصير قبل إعادة التحميل لضمان حفظ البيانات
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ البيانات المحلية:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// Helper function to get last sync time
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// Helper function to check if sync is needed
export const isSyncNeeded = (): boolean => {
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  // Also check if last sync was more than a day ago
  const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  if (lastSyncStr) {
    const lastSync = new Date(lastSyncStr);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (lastSync < oneDayAgo) return true;
  }
  
  return !hasChannels || !hasCategories || !hasCountries;
};

// ضمان تحديث البيانات على جميع الأجهزة
export const ensureDataPropagation = () => {
  // إضافة علامات زمنية متعددة لضمان ظهور التحديثات
  const timestamp = Date.now().toString();
  
  localStorage.setItem('data_update_timestamp', timestamp);
  localStorage.setItem('sync_complete_time', timestamp);
  localStorage.setItem('update_notification', timestamp);
  localStorage.setItem('force_cache_refresh', timestamp);
  localStorage.setItem('bladi_info_update', timestamp);
  localStorage.setItem('data_version', timestamp);
  
  // تحديث علامات للمواقع المعروفة
  localStorage.setItem('bladi_update_version', timestamp);
  localStorage.setItem('bladi_update_channels', 'true');
  localStorage.setItem('bladi_force_refresh', 'true');
  
  return timestamp;
};

// Alias for backward compatibility
export const forceSync = syncWithLocalData;
export const syncWithRemoteAPI = syncWithLocalData; // For backward compatibility
