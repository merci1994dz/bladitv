
/**
 * مسؤول عن إدارة حالة المزامنة الأساسية
 */

import { STORAGE_KEYS } from '../../config';

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
