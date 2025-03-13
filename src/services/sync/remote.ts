
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

// Function to sync with remote source
export const syncWithRemoteSource = async (remoteUrl: string): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('جاري المزامنة مع المصدر الخارجي:', remoteUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانية للمهلة الزمنية
    
    try {
      const response = await fetch(remoteUrl, { 
        signal: controller.signal,
        cache: 'no-store', // تجنب التخزين المؤقت
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
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
      const lastSyncTime = updateLastSyncTime();
      
      // تحديث البيانات المخزنة مؤقتًا
      const remoteConfig = {
        url: remoteUrl,
        lastSync: lastSyncTime
      };
      localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
      
      console.log('تم تحديث البيانات بنجاح من المصدر الخارجي');
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
