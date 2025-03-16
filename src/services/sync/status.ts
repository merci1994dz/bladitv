
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
      
      // تحقق مما إذا كانت المزامنة نشطة ولم تتجاوز 60 ثانية
      if (isActive && Date.now() - timestamp < 60 * 1000) {
        return true;
      }
      
      // إذا تجاوزت 60 ثانية، فمن المحتمل أن تكون المزامنة قد توقفت بشكل غير متوقع
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
  
  // التحقق من القدرة على الوصول إلى الخادم
  let hasServerAccess = false;
  
  if (hasInternet) {
    try {
      // محاولة الوصول إلى الخادم الرئيسي باستخدام طلب بسيط
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://bladitv.lovable.app/ping', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      hasServerAccess = response.ok;
    } catch (error) {
      console.warn('تعذر الوصول إلى الخادم الرئيسي:', error);
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
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const isActive = isSyncInProgress();
    
    return { lastSync, isActive };
  } catch (error) {
    console.error('خطأ في الحصول على معلومات حالة المزامنة:', error);
    return { lastSync: null, isActive: false };
  }
};
