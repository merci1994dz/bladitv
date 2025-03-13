
import { STORAGE_KEYS, SECURITY_CONFIG, REMOTE_CONFIG } from './config';
import { channels, countries, categories, setIsSyncing } from './dataStore';

// تشفير الروابط الحساسة إذا لزم الأمر (وظيفة مبسطة)
function obfuscateStreamUrls(data: any[]): any[] {
  if (!SECURITY_CONFIG.LOG_ACCESS_ATTEMPTS) return data;
  
  return data.map(item => {
    if (item.streamUrl) {
      // نحتفظ بالرابط الأصلي ولكن في الوقت نفسه نسجل محاولة الوصول
      console.log('تم الوصول لقائمة الروابط - إجراء أمني');
    }
    return item;
  });
}

// Function that simulates syncing but actually just uses local data
export const syncWithRemoteAPI = async (): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('Using local data only (no remote sync)');
    
    // Simply save current data to localStorage
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Update last sync time
    const lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
    
    console.log('Local data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving local data:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// Function to manually trigger sync with local data
export const forceSync = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};

// وظيفة لتحديث البيانات من مصدر خارجي
export const syncWithRemoteSource = async (remoteUrl: string): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('جاري المزامنة مع المصدر الخارجي:', remoteUrl);
    
    const response = await fetch(remoteUrl);
    if (!response.ok) {
      throw new Error(`فشل الاتصال بالمصدر الخارجي: ${response.status}`);
    }
    
    const remoteData = await response.json();
    
    // التحقق من صحة البيانات
    if (!remoteData || !remoteData.channels || !remoteData.countries || !remoteData.categories) {
      throw new Error('تنسيق البيانات من المصدر الخارجي غير صالح');
    }
    
    // تحديث البيانات المحلية
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(remoteData.channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(remoteData.countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteData.categories));
    
    // تحديث وقت آخر مزامنة
    const lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
    
    // تحديث البيانات المخزنة مؤقتًا
    const remoteConfig = {
      url: remoteUrl,
      lastSync: lastSyncTime
    };
    localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
    
    console.log('تم تحديث البيانات بنجاح من المصدر الخارجي');
    return true;
  } catch (error) {
    console.error('خطأ في تحديث البيانات من المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// Sync all data locally
export const syncAllData = async (): Promise<boolean> => {
  // التحقق من وجود تكوين للتحديث عن بُعد
  const remoteConfigStr = localStorage.getItem(STORAGE_KEYS.REMOTE_CONFIG);
  if (REMOTE_CONFIG.ENABLED && remoteConfigStr) {
    try {
      const remoteConfig = JSON.parse(remoteConfigStr);
      if (remoteConfig && remoteConfig.url) {
        return await syncWithRemoteSource(remoteConfig.url);
      }
    } catch (error) {
      console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
    }
  }
  
  // إذا لم يكن هناك مصدر خارجي أو فشلت المزامنة، استخدم البيانات المحلية
  return await syncWithRemoteAPI();
};

// Get the last sync time
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// Check if sync is needed (no data in localStorage)
export const isSyncNeeded = (): boolean => {
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  return !hasChannels || !hasCategories || !hasCountries;
};

// This variable tracks if sync is currently in progress
let syncInProgress = false;

// Check if sync is currently in progress
export const isSyncInProgress = (): boolean => {
  return syncInProgress;
};

// وظيفة للحصول على تكوين المصدر الخارجي
export const getRemoteConfig = (): { url: string; lastSync: string } | null => {
  try {
    const remoteConfigStr = localStorage.getItem(STORAGE_KEYS.REMOTE_CONFIG);
    if (remoteConfigStr) {
      return JSON.parse(remoteConfigStr);
    }
    return null;
  } catch (error) {
    console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
    return null;
  }
};

// وظيفة لتعيين تكوين المصدر الخارجي
export const setRemoteConfig = (url: string): void => {
  const remoteConfig = {
    url,
    lastSync: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
};

// Initialize sync on application startup (only if needed)
if (isSyncNeeded()) {
  syncAllData().catch(error => {
    console.error('Initial sync failed:', error);
  });
}
