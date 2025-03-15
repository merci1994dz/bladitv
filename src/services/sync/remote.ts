
import { STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';

// Functions for remote config management
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

export const setRemoteConfig = (url: string): void => {
  const remoteConfig = {
    url,
    lastSync: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
};

// Improved function to sync with remote source
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('جاري المزامنة مع المصدر الخارجي:', remoteUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    try {
      // Add cache-control headers and parameters to prevent caching
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Add random query parameter to bust cache
      const urlWithCacheBuster = remoteUrl.includes('?') 
        ? `${remoteUrl}&_=${Date.now()}` 
        : `${remoteUrl}?_=${Date.now()}`;
      
      const response = await fetch(urlWithCacheBuster, { 
        signal: controller.signal,
        cache: 'no-store', 
        headers
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`فشل الاتصال بالمصدر الخارجي: ${response.status}`);
      }
      
      const remoteData = await response.json();
      
      // Data validation
      if (!remoteData || !remoteData.channels || !remoteData.countries || !remoteData.categories) {
        throw new Error('تنسيق البيانات من المصدر الخارجي غير صالح');
      }
      
      // For forced refresh, we completely replace the data
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(remoteData.channels));
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(remoteData.countries));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteData.categories));
      
      // Update last sync time
      const lastSyncTime = updateLastSyncTime();
      
      // Update stored config
      const remoteConfig = {
        url: remoteUrl.split('?')[0], // Store the clean URL without parameters
        lastSync: lastSyncTime
      };
      localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
      
      console.log('تم تحديث البيانات بنجاح من المصدر الخارجي');
      
      // Force page reload in cases of significant data changes (for admin actions)
      if (forceRefresh) {
        window.location.reload();
      }
      
      return true;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('انتهت المهلة الزمنية للاتصال بالمصدر الخارجي');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('خطأ في تحديث البيانات من المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
