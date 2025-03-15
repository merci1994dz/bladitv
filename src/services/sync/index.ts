
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
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting)
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    
    // التحقق من وجود تكوين خارجي
    const remoteConfigStr = localStorage.getItem('tv_remote_config');
    if (REMOTE_CONFIG.ENABLED && remoteConfigStr) {
      try {
        const remoteConfig = JSON.parse(remoteConfigStr);
        if (remoteConfig && remoteConfig.url) {
          // إضافة معامل كسر التخزين المؤقت للرابط
          const urlWithCacheBuster = remoteConfig.url.includes('?') 
            ? `${remoteConfig.url}&_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}` 
            : `${remoteConfig.url}${cacheBuster}`;
            
          return await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
        }
      } catch (error) {
        console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
      }
    }
    
    // إذا لم يكن هناك مصدر خارجي أو فشلت المزامنة، استخدم البيانات المحلية
    return await syncWithLocalData(forceRefresh);
  } finally {
    setIsSyncing(false);
  }
};

// تحسين دالة التحديث القسري - تضمن تحديث جميع البيانات
export const forceDataRefresh = async (): Promise<boolean> => {
  // مسح بيانات القنوات من التخزين المحلي لفرض التحديث
  localStorage.removeItem('last_sync_time');
  localStorage.removeItem('last_sync');
  
  // فرض إعادة تحميل البيانات المخزنة مؤقتًا
  localStorage.setItem('force_refresh', Date.now().toString());
  
  // حفظ القنوات الحالية لضمان تضمينها في التخزين المحلي
  saveChannelsToStorage();
  
  // فرض التحديث
  const success = await syncAllData(true);
  
  // إضافة علامة خاصة لاكتشاف التغييرات
  localStorage.setItem('bladi_info_update', Date.now().toString());
  
  // إجبار المتصفح على إعادة التحميل لإظهار البيانات الجديدة
  if (success) {
    // إضافة تأخير مناسب لضمان اكتمال المزامنة
    setTimeout(() => {
      // إضافة علامة زمنية وعلامة تحميل إجباري قبل إعادة التحميل
      localStorage.setItem('force_browser_refresh', 'true');
      localStorage.setItem('refresh_timestamp', Date.now().toString());
      // إعادة تحميل الصفحة
      window.location.reload();
    }, 1500);
  }
  
  return success;
};

// دالة للتحقق من حالة المزامنة
export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

// دالة للتحقق وإجراء المزامنة الأولية عند بدء التطبيق
export const performInitialSync = (): void => {
  if (isSyncNeeded()) {
    syncAllData().catch(error => {
      console.error('فشلت المزامنة الأولية:', error);
    });
  }
};

// تحسين دالة نشر القنوات لجميع المستخدمين
export const publishChannelsToAllUsers = async (): Promise<boolean> => {
  console.log('نشر القنوات لجميع المستخدمين...');
  
  try {
    // 1. حفظ القنوات في التخزين المحلي
    const saveResult = saveChannelsToStorage();
    if (!saveResult) {
      throw new Error('فشل في حفظ القنوات إلى التخزين المحلي');
    }
    
    // 2. إضافة علامات زمنية متعددة للتأكد من أن كل المستخدمين سيرون البيانات المحدثة
    const timestamp = Date.now().toString();
    localStorage.setItem('data_version', timestamp);
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('channels_last_update', timestamp);
    localStorage.setItem('force_update', 'true');
    
    // 3. إضافة علامات خاصة
    localStorage.setItem('bladi_update_version', timestamp);
    localStorage.setItem('bladi_update_channels', 'true');
    localStorage.setItem('bladi_force_refresh', 'true');
    localStorage.setItem('force_browser_refresh', 'true');
    
    // 4. تطبيق المزامنة القسرية - بدون إعادة تحميل (سنقوم بذلك بعد التأكد من نجاح العملية)
    const syncResult = await syncAllData(true);
    
    // 5. فرض إعادة تحميل الصفحة بعد نجاح العملية
    if (syncResult) {
      setTimeout(() => {
        localStorage.setItem('refresh_complete', timestamp);
        window.location.reload();
      }, 1800);
    }
    
    console.log('نتيجة النشر للمستخدمين:', { saveResult, syncResult });
    
    return syncResult;
  } catch (error) {
    console.error('فشل في نشر القنوات للمستخدمين:', error);
    return false;
  }
};

// وظيفة جديدة لتأكيد وصول التحديثات للمستخدمين
export const verifyUpdatesPropagation = async (): Promise<boolean> => {
  try {
    // إضافة علامات زمنية متعددة بأنماط مختلفة لمختلف المتصفحات
    const timestamp = Date.now().toString();
    const methods = [
      // LocalStorage
      () => localStorage.setItem('data_version', timestamp),
      () => localStorage.setItem('bladi_info_update', timestamp),
      () => localStorage.setItem('force_browser_refresh', 'true'),
      
      // SessionStorage
      () => sessionStorage.setItem('update_notification', timestamp),
      
      // Cookies (بسيطة، تنتهي بعد الجلسة)
      () => document.cookie = `update_check=${timestamp}; path=/;`,
      
      // المحاولة على فترات متقاربة
      () => setTimeout(() => localStorage.setItem('delayed_update', timestamp), 500),
      () => setTimeout(() => localStorage.setItem('force_refresh', 'true'), 1000),
      () => setTimeout(() => localStorage.setItem('final_update_check', timestamp), 1500)
    ];
    
    // تنفيذ جميع طرق النشر
    methods.forEach(method => method());
    
    // إجراء المزامنة القسرية
    await syncAllData(true);
    
    // إجبار إعادة التحميل بعد تأخير كافٍ
    setTimeout(() => {
      localStorage.setItem('final_check', timestamp);
      window.location.reload();
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('فشل في التحقق من نشر التحديثات:', error);
    return false;
  }
};

// Initialize sync on application startup (only if needed)
performInitialSync();
