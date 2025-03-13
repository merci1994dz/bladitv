
import { STORAGE_KEYS, SECURITY_CONFIG, REMOTE_CONFIG } from './config';
import { channels, countries, categories, setIsSyncing, isSyncing } from './dataStore';

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

// Sync all data 
export const syncAllData = async (): Promise<boolean> => {
  if (isSyncing) {
    console.log('المزامنة قيد التنفيذ بالفعل');
    return false;
  }
  
  try {
    setIsSyncing(true);
    
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
  } finally {
    setIsSyncing(false);
  }
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
  
  // أيضًا، التحقق من وقت آخر مزامنة - إذا كان أكثر من يوم، نحتاج إلى المزامنة
  const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  if (lastSyncStr) {
    const lastSync = new Date(lastSyncStr);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (lastSync < oneDayAgo) return true;
  }
  
  return !hasChannels || !hasCategories || !hasCountries;
};

// Check if sync is currently in progress
export const isSyncInProgress = (): boolean => {
  return isSyncing;
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

// وظيفة المزامنة التلقائية - تتحقق من وجود بيانات جديدة كل فترة زمنية محددة
export const setupAutoSync = (): (() => void) => {
  // إذا كانت المزامنة التلقائية غير ممكنة، لا تفعل شيئًا
  if (!REMOTE_CONFIG.ENABLED) {
    return () => {}; // وظيفة فارغة للتنظيف
  }
  
  // المزامنة عند التهيئة إذا لزم الأمر
  if (isSyncNeeded()) {
    syncAllData().catch(console.error);
  }
  
  // إنشاء مزامنة دورية
  const intervalId = setInterval(() => {
    // إذا كانت هناك مزامنة قيد التنفيذ، تخطي هذه الدورة
    if (isSyncing) return;
    
    // التحقق مما إذا كانت المزامنة مطلوبة (أكثر من فترة زمنية معينة منذ آخر مزامنة)
    const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (lastSyncStr) {
      const lastSync = new Date(lastSyncStr);
      const syncInterval = REMOTE_CONFIG.CHECK_INTERVAL;
      const nextSyncTime = new Date(lastSync.getTime() + syncInterval);
      
      if (new Date() >= nextSyncTime) {
        syncAllData().catch(console.error);
      }
    } else {
      // إذا لم تكن هناك مزامنة سابقة، قم بالمزامنة الآن
      syncAllData().catch(console.error);
    }
  }, Math.min(REMOTE_CONFIG.CHECK_INTERVAL, 3600000)); // التحقق كل ساعة على الأقل
  
  // إرجاع وظيفة للتنظيف
  return () => clearInterval(intervalId);
};

// Initialize sync on application startup (only if needed)
if (isSyncNeeded()) {
  syncAllData().catch(error => {
    console.error('Initial sync failed:', error);
  });
}
