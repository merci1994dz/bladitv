
import { REMOTE_CONFIG } from '../config';
import { isSyncing, setIsSyncing, saveChannelsToStorage } from '../dataStore';
import { getRemoteConfig, setRemoteConfig, syncWithRemoteSource } from './remote';
import { syncWithLocalData, getLastSyncTime, isSyncNeeded, forceSync, obfuscateStreamUrls, syncWithRemoteAPI } from './local';
import { setupAutoSync } from './auto';
// Import the refactored settings sync functionality
import { setupSettingsListener, broadcastSettingsUpdate, forceAppReloadForAllUsers } from './settingsSync';

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

// Export the refactored settings sync functionality
export {
  setupSettingsListener,
  broadcastSettingsUpdate,
  forceAppReloadForAllUsers
} from './settingsSync';

// آلية قفل المزامنة المحسنة
let syncLock = false;
let syncQueue: (() => Promise<boolean>)[] = [];
let lockTimeout: number | null = null;

// دالة لتحرير قفل المزامنة بشكل آمن
const releaseSyncLock = () => {
  syncLock = false;
  setIsSyncing(false);
  
  // تنفيذ العمليات المنتظرة في الطابور
  if (syncQueue.length > 0) {
    const nextSync = syncQueue.shift();
    if (nextSync) {
      setTimeout(() => {
        nextSync().catch(console.error);
      }, 500); // تأخير بسيط قبل تنفيذ العملية التالية
    }
  }
  
  // إلغاء مؤقت القفل إذا كان نشطًا
  if (lockTimeout) {
    clearTimeout(lockTimeout);
    lockTimeout = null;
  }
};

// Main sync function - محسنة مع آلية قفل آمنة ومعالجة الطوابير
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  // إذا كانت المزامنة قيد التنفيذ، إضافة الطلب إلى الطابور
  if (syncLock || isSyncing) {
    console.log('المزامنة قيد التنفيذ بالفعل، إضافة الطلب إلى الطابور');
    
    // إضافة الوظيفة إلى الطابور (إعادة استدعاء النفس)
    return new Promise((resolve) => {
      syncQueue.push(async () => {
        const result = await syncAllData(forceRefresh);
        resolve(result);
        return result;
      });
    });
  }
  
  // وضع قفل المزامنة
  syncLock = true;
  setIsSyncing(true);
  
  // إعداد مؤقت للحماية من القفل الدائم (15 ثانية كحد أقصى)
  lockTimeout = window.setTimeout(() => {
    console.warn('تجاوز الوقت المحدد للمزامنة، تحرير القفل بالقوة');
    releaseSyncLock();
  }, 15000);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري =', forceRefresh);
    
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
            
          const result = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
          releaseSyncLock();
          return result;
        }
      } catch (error) {
        console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
      }
    }
    
    // إذا لم يكن هناك مصدر خارجي أو فشلت المزامنة، استخدم البيانات المحلية
    const result = await syncWithLocalData(forceRefresh);
    return result;
  } catch (error) {
    console.error('خطأ أثناء المزامنة:', error);
    return false;
  } finally {
    // تحرير قفل المزامنة
    releaseSyncLock();
  }
};

// تحسين دالة التحديث القسري - تضمن تحديث جميع البيانات
export const forceDataRefresh = async (): Promise<boolean> => {
  console.log('بدء عملية التحديث القسري للبيانات...');
  
  try {
    // مسح بيانات القنوات من التخزين المحلي لفرض التحديث
    localStorage.removeItem('last_sync_time');
    localStorage.removeItem('last_sync');
    
    // فرض إعادة تحميل البيانات المخزنة مؤقتًا
    const timestamp = Date.now().toString();
    localStorage.setItem('force_refresh', timestamp);
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('data_version', timestamp);
    localStorage.setItem('channels_last_update', timestamp);
    
    // حفظ القنوات الحالية لضمان تضمينها في التخزين المحلي
    saveChannelsToStorage();
    
    // محاولة إجراء المزامنة القسرية
    const success = await syncAllData(true);
    
    // إضافة علامات خاصة متعددة لاكتشاف التغييرات
    const newTimestamp = Date.now().toString(); // استخدام طابع زمني جديد
    localStorage.setItem('bladi_info_update', newTimestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('refresh_timestamp', newTimestamp);
    localStorage.setItem('bladi_force_refresh', 'true');
    localStorage.setItem('final_update_check', newTimestamp);
    
    // محاولة استخدام sessionStorage أيضًا
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('reload_time', newTimestamp);
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // محاولة استخدام cookies أيضًا
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `reload_time=${newTimestamp}; path=/;`;
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // إجبار المتصفح على إعادة التحميل لإظهار البيانات الجديدة
    if (success) {
      // إضافة تأخير مناسب لضمان اكتمال المزامنة
      setTimeout(() => {
        // إضافة معلمة URL لمنع التخزين المؤقت أثناء إعادة التحميل
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
      }, 1500);
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في التحديث القسري:', error);
    return false;
  }
};

// دالة للتحقق من حالة المزامنة
export const isSyncInProgress = (): boolean => {
  return isSyncing || syncLock;
};

// دالة للتحقق وإجراء المزامنة الأولية عند بدء التطبيق
export const performInitialSync = async (): Promise<boolean> => {
  if (isSyncNeeded()) {
    try {
      console.log('بدء المزامنة الأولية...');
      return await syncAllData();
    } catch (error) {
      console.error('فشلت المزامنة الأولية:', error);
      return false;
    }
  }
  return true;
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
    
    // علامات متعددة لزيادة فرص الاكتشاف
    const updateKeys = [
      'data_version',
      'bladi_info_update',
      'channels_last_update',
      'force_update',
      'bladi_update_version',
      'bladi_update_channels',
      'bladi_force_refresh',
      'force_browser_refresh'
    ];
    
    // تطبيق جميع العلامات
    updateKeys.forEach(key => {
      if (key.includes('force') || key.includes('refresh')) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.setItem(key, timestamp);
      }
    });
    
    // 3. محاولة استخدام sessionStorage أيضًا
    try {
      sessionStorage.setItem('force_reload', 'true');
      sessionStorage.setItem('reload_time', timestamp);
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // 4. محاولة استخدام cookies أيضًا
    try {
      document.cookie = `force_reload=true; path=/;`;
      document.cookie = `reload_time=${timestamp}; path=/;`;
    } catch (e) {
      // تجاهل الأخطاء هنا
    }
    
    // 5. تطبيق المزامنة القسرية
    const syncResult = await syncAllData(true);
    
    // 6. فرض إعادة تحميل الصفحة بعد نجاح العملية
    if (syncResult) {
      setTimeout(() => {
        localStorage.setItem('refresh_complete', timestamp);
        
        // إعادة تحميل مع منع التخزين المؤقت
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
      }, 1800);
    }
    
    console.log('نتيجة النشر للمستخدمين:', { saveResult, syncResult });
    
    return syncResult;
  } catch (error) {
    console.error('فشل في نشر القنوات للمستخدمين:', error);
    return false;
  }
};

// وظيفة محسنة لتأكيد وصول التحديثات للمستخدمين
export const verifyUpdatesPropagation = async (): Promise<boolean> => {
  try {
    // إضافة علامات زمنية متعددة بأنماط مختلفة لمختلف المتصفحات
    const timestamp = Date.now().toString();
    
    // مصفوفة من الوظائف لتنفيذ مختلف طرق النشر
    const methods = [
      // LocalStorage - الطريقة الأساسية
      () => localStorage.setItem('data_version', timestamp),
      () => localStorage.setItem('bladi_info_update', timestamp),
      () => localStorage.setItem('force_browser_refresh', 'true'),
      () => localStorage.setItem('channels_last_update', timestamp),
      () => localStorage.setItem('bladi_update_version', timestamp),
      
      // SessionStorage - طريقة إضافية
      () => sessionStorage.setItem('update_notification', timestamp),
      () => sessionStorage.setItem('force_reload', 'true'),
      
      // Cookies - طريقة ثالثة
      () => document.cookie = `update_check=${timestamp}; path=/;`,
      () => document.cookie = `force_reload=true; path=/;`,
      
      // المحاولة على فترات متقاربة للتأكد من استلام التحديث
      () => setTimeout(() => localStorage.setItem('delayed_update', timestamp), 300),
      () => setTimeout(() => localStorage.setItem('force_refresh', 'true'), 600),
      () => setTimeout(() => localStorage.setItem('final_update_check', timestamp), 900),
      () => setTimeout(() => localStorage.setItem('refresh_signal', timestamp), 1200)
    ];
    
    // تنفيذ جميع طرق النشر
    methods.forEach(method => {
      try {
        method();
      } catch (e) {
        // تجاهل الأخطاء في وظائف فردية
        console.error('فشل في تنفيذ إحدى طرق النشر:', e);
      }
    });
    
    // إجراء المزامنة القسرية
    await syncAllData(true);
    
    // إجبار إعادة التحميل بعد تأخير كافٍ
    setTimeout(() => {
      localStorage.setItem('final_check', timestamp);
      
      // إعادة تحميل مع منع التخزين المؤقت
      window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
    }, 1800);
    
    return true;
  } catch (error) {
    console.error('فشل في التحقق من نشر التحديثات:', error);
    return false;
  }
};

// إنشاء دالة جديدة للنشر المباشر والقوي للبيانات
export const forceBroadcastToAllBrowsers = async (): Promise<boolean> => {
  console.log('بدء النشر القسري والقوي لجميع المتصفحات...');
  
  try {
    // 1. حفظ البيانات الحالية
    saveChannelsToStorage();
    
    // 2. إنشاء معرف فريد للتحديث
    const updateId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
    
    // 3. إرسال إشارات متعددة ومتنوعة
    const signals = [
      { key: 'force_browser_refresh', value: 'true' },
      { key: 'bladi_force_refresh', value: 'true' },
      { key: 'data_version', value: updateId },
      { key: 'bladi_info_update', value: updateId },
      { key: 'channels_last_update', value: updateId },
      { key: 'update_broadcast_id', value: updateId },
      { key: 'force_update', value: 'true' },
      { key: 'refresh_timestamp', value: updateId }
    ];
    
    // تطبيق الإشارات بطريقة متسلسلة بفواصل زمنية قصيرة
    let delay = 0;
    const step = 100; // 100 مللي ثانية بين كل إشارة
    
    for (const signal of signals) {
      setTimeout(() => {
        localStorage.setItem(signal.key, signal.value);
        console.log(`تم إرسال إشارة: ${signal.key} = ${signal.value}`);
      }, delay);
      delay += step;
    }
    
    // 4. تطبيق المزامنة القسرية
    setTimeout(async () => {
      await syncAllData(true);
      
      // 5. إرسال إشارة نهائية بعد اكتمال المزامنة
      localStorage.setItem('sync_complete', updateId);
      localStorage.setItem('force_browser_refresh', 'true');
      
      // 6. إجبار إعادة تحميل الصفحة الحالية
      setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + updateId;
      }, 1500);
    }, delay + 200);
    
    return true;
  } catch (error) {
    console.error('فشل في النشر القسري:', error);
    return false;
  }
};

// تنفيذ المزامنة الأولية عند تحميل الوحدة
performInitialSync().catch(console.error);
