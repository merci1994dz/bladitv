
/**
 * مستمع لتغييرات الإعدادات
 * Listener for settings changes
 */

import { syncData } from '../index';
import { getLastSyncTime } from '../config';

// إعداد مستمع لتغييرات الإعدادات
export const setupSettingsSyncListener = (): (() => void) => {
  console.log('إعداد مستمع لتغييرات الإعدادات...');
  
  // مستمع للتحقق من وجود علامة التحديث الإجباري
  const checkForRefreshFlag = async () => {
    try {
      // التحقق من وجود علامة التحديث الإجباري في التخزين المحلي
      const forceRefresh = localStorage.getItem('force_browser_refresh');
      
      if (forceRefresh === 'true') {
        console.log('تم اكتشاف علامة التحديث الإجباري، جاري المزامنة...');
        
        // مسح العلامة
        localStorage.removeItem('force_browser_refresh');
        
        // تنفيذ المزامنة
        await syncData(true);
        
        // إطلاق حدث تحديث البيانات
        const event = new CustomEvent('app_data_updated', {
          detail: { source: 'settings_sync', timestamp: Date.now() }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('خطأ في التحقق من علامة التحديث الإجباري:', error);
    }
  };
  
  // فحص فوري
  checkForRefreshFlag();
  
  // إعداد فحص دوري
  const intervalId = setInterval(checkForRefreshFlag, 60000); // كل دقيقة
  
  // مستمع لتغييرات التخزين المحلي
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'force_browser_refresh' && event.newValue === 'true') {
      console.log('تم اكتشاف تغيير في علامة التحديث الإجباري، جاري المزامنة...');
      checkForRefreshFlag();
    }
  };
  
  // إعداد مستمع التخزين المحلي
  window.addEventListener('storage', handleStorageChange);
  
  // دالة التنظيف
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('storage', handleStorageChange);
  };
};

// الحصول على حالة المزامنة الحالية
export const getSyncStatus = () => {
  const lastSyncTime = getLastSyncTime();
  const lastSync = lastSyncTime ? new Date(lastSyncTime) : null;
  
  return {
    lastSync,
    lastSyncFormatted: lastSync ? lastSync.toLocaleString() : 'لم تتم المزامنة بعد',
    hasEverSynced: !!lastSyncTime
  };
};
