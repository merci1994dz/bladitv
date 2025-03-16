
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
 * فحص ما إذا كانت هناك أي مشاكل اتصال تعرقل المزامنة
 */
export const checkConnectivityIssues = async (): Promise<{ hasInternet: boolean, hasServerAccess: boolean }> => {
  // التحقق من وجود اتصال بالإنترنت
  const hasInternet = navigator.onLine;
  
  // التحقق من القدرة على الوصول إلى الخادم مع زيادة المهلة
  let hasServerAccess = false;
  
  if (hasInternet) {
    try {
      // محاولة الوصول إلى الخادم الرئيسي باستخدام طلب بسيط مع زيادة المهلة إلى 10 ثواني
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // تجربة المواقع المختلفة
      const urls = [
        'https://bladitv.lovable.app/ping',
        'https://bladi-info.com/ping',
        'https://bladiinfo-api.vercel.app/ping',
        'https://bladiinfo-backup.netlify.app/ping'
      ];
      
      // محاولة الاتصال بالمواقع المختلفة حتى ينجح أحدها
      for (const url of urls) {
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          if (response.ok) {
            hasServerAccess = true;
            break;
          }
        } catch (e) {
          // استمر في المحاولة مع المصدر التالي
          console.warn(`تعذر الوصول إلى ${url}:`, e);
        }
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.warn('تعذر الوصول إلى جميع خوادم المزامنة:', error);
      hasServerAccess = false;
    }
  }
  
  return { hasInternet, hasServerAccess };
};

/**
 * الحصول على معلومات حالة المزامنة
 */
export const getSyncStatus = (): { lastSync: string | null; isActive: boolean; } => {
  try {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const isActive = isSyncInProgress();
    
    return { lastSync, isActive };
  } catch (error) {
    console.error('خطأ في الحصول على معلومات حالة المزامنة:', error);
    return { lastSync: null, isActive: false };
  }
};
