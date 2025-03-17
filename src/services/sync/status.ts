import { STORAGE_KEYS } from '../config';

/**
 * تحقق مما إذا كانت المزامنة قيد التنفيذ حاليًا
 */
export const isSyncInProgress = (): boolean => {
  try {
    // فحص متغير الحالة في localStorage
    const syncStatusRaw = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
    if (syncStatusRaw) {
      const syncStatus = JSON.parse(syncStatusRaw);
      const { isActive, timestamp } = syncStatus;
      
      // تحقق مما إذا كانت المزامنة نشطة ولم تتجاوز 120 ثانية (زيادة من 60 إلى 120)
      if (isActive && Date.now() - timestamp < 120 * 1000) {
        return true;
      }
      
      // إذا تجاوزت 120 ثانية، فمن المحتمل أن تكون المزامنة قد توقفت بشكل غير متوقع
      if (isActive) {
        // إعادة تعيين الحالة
        localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify({
          isActive: false,
          timestamp: Date.now()
        }));
      }
    }
    
    return false;
  } catch (error) {
    console.error('خطأ في التحقق من حالة المزامنة:', error);
    return false;
  }
};

/**
 * تعيين حالة المزامنة النشطة
 */
export const setSyncActive = (isActive: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify({
      isActive,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('خطأ في تعيين حالة المزامنة:', error);
  }
};

/**
 * تعيين خطأ المزامنة
 */
export const setSyncError = (error: string | null): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_ERROR, error ? JSON.stringify({ message: error, timestamp: Date.now() }) : '');
  } catch (e) {
    console.error('خطأ في تعيين خطأ المزامنة:', e);
  }
};

/**
 * مسح خطأ المزامنة
 */
export const clearSyncError = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SYNC_ERROR);
  } catch (e) {
    console.error('خطأ في مسح خطأ المزامنة:', e);
  }
};

/**
 * تعيين طابع وقت المزامنة
 */
export const setSyncTimestamp = (timestamp: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, timestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp); // للتوافق مع التطبيقات القديمة
  } catch (e) {
    console.error('خطأ في تعيين وقت المزامنة:', e);
  }
};

/**
 * الحصول على آخر وقت مزامنة
 */
export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (e) {
    console.error('خطأ في الحصول على آخر وقت مزامنة:', e);
    return null;
  }
};

/**
 * فحص ما إذا كانت هناك أي مشاكل اتصال تعرقل المزامنة
 */
export const checkConnectivityIssues = async (): Promise<{ hasInternet: boolean, hasServerAccess: boolean }> => {
  // التحقق من وجود اتصال بالإنترنت
  const hasInternet = navigator.onLine;
  
  // التحقق من القدرة على الوصول إلى الخادم
  let hasServerAccess = false;
  
  if (hasInternet) {
    try {
      // محاولة الوصول إلى الخادم الرئيسي باستخدام طلب بسيط
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // تجربة المواقع المختلفة بشكل متوازي لتحسين الأداء
      const urls = [
        'https://bladitv.lovable.app/ping',
        'https://bladi-info.com/ping',
        'https://bladiinfo-api.vercel.app/ping',
        'https://bladiinfo-backup.netlify.app/ping',
        'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/ping'
      ];
      
      const connectionChecks = urls.map(url => 
        fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        .then(response => response.ok)
        .catch(() => false)
      );
      
      // انتظار حتى تنجح إحدى الطلبات أو تفشل جميعها
      const results = await Promise.allSettled(connectionChecks);
      
      clearTimeout(timeoutId);
      
      // إذا نجح أي طلب، فهناك وصول للخادم
      hasServerAccess = results.some(result => 
        result.status === 'fulfilled' && result.value === true
      );
      
      // حفظ نتيجة الاتصال للاستخدام لاحقاً
      try {
        sessionStorage.setItem('last_connectivity_check', JSON.stringify({
          hasInternet,
          hasServerAccess,
          timestamp: Date.now()
        }));
      } catch (e) {
        // تجاهل أخطاء التخزين
      }
    } catch (error) {
      console.warn('تعذر الوصول إ��ى خوادم المزامنة:', error);
      hasServerAccess = false;
    }
  }
  
  // تحسين الأداء: استخدام القيم المخزنة إذا كان الفحص الأخير حديثًا (أقل من دقيقة)
  if (!hasServerAccess) {
    try {
      const lastCheckStr = sessionStorage.getItem('last_connectivity_check');
      if (lastCheckStr) {
        const lastCheck = JSON.parse(lastCheckStr);
        const isRecent = Date.now() - lastCheck.timestamp < 60000; // أقل من دقيقة
        
        if (isRecent && lastCheck.hasServerAccess) {
          hasServerAccess = true;
        }
      }
    } catch (e) {
      // تجاهل أخطاء التخزين
    }
  }
  
  return { hasInternet, hasServerAccess };
};

/**
 * الحصول على معلومات حالة المزامنة الكاملة
 */
export const getSyncStatus = (): { 
  lastSync: string | null; 
  isActive: boolean;
  networkStatus: { hasInternet: boolean; hasServerAccess: boolean };
} => {
  try {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const isActive = isSyncInProgress();
    
    // محاولة استرداد آخر حالة اتصال معروفة
    let networkStatus = { hasInternet: navigator.onLine, hasServerAccess: false };
    try {
      const lastCheckStr = sessionStorage.getItem('last_connectivity_check');
      if (lastCheckStr) {
        const lastCheck = JSON.parse(lastCheckStr);
        networkStatus = {
          hasInternet: navigator.onLine, // استخدام القيمة الحالية
          hasServerAccess: lastCheck.hasServerAccess
        };
      }
    } catch (e) {
      // تجاهل أخطاء التخزين
    }
    
    return { 
      lastSync, 
      isActive,
      networkStatus
    };
  } catch (error) {
    console.error('خطأ في الحصول على معلومات حالة المزامنة:', error);
    return { 
      lastSync: null, 
      isActive: false,
      networkStatus: { hasInternet: navigator.onLine, hasServerAccess: false }
    };
  }
};
