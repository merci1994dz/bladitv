
import { syncAllData, forceDataRefresh, getLastSyncTime } from './index';

// دالة إعداد مستمع للتغييرات في البيانات
export const setupSettingsListener = (): (() => void) => {
  console.log('بدء تهيئة مستمع التغييرات للبيانات');
  
  // معالج التغييرات في التخزين المحلي
  const handleStorageChange = (event: StorageEvent) => {
    // التحقق من التغييرات في القنوات أو مؤشرات التحديث
    if (
      event.key === 'tv_channels' ||
      event.key === 'bladi_info_update' ||
      event.key === 'data_version' ||
      event.key === 'force_browser_refresh' ||
      event.key === 'force_refresh'
    ) {
      console.log(`تم اكتشاف تغيير في: ${event.key}، إعادة تحميل البيانات...`);
      
      // إذا كان التغيير يتطلب إعادة تحميل كاملة
      if (
        event.key === 'force_browser_refresh' && 
        event.newValue === 'true'
      ) {
        console.log('تم طلب إعادة تحميل الصفحة، جاري التنفيذ...');
        window.location.reload();
        return;
      }
      
      // تحديث البيانات دون إعادة تحميل الصفحة
      syncAllData(false).catch(err => {
        console.error('خطأ في تحديث البيانات بعد التغيير:', err);
      });
    }
  };
  
  // تفعيل الاستماع للتغييرات
  window.addEventListener('storage', handleStorageChange);
  
  // مزامنة البيانات عند بدء التشغيل
  const checkLastSync = () => {
    const lastSync = getLastSyncTime();
    const now = Date.now();
    
    // إذا لم يكن هناك مزامنة سابقة أو مر وقت طويل على آخر مزامنة (5 دقائق)
    if (!lastSync || (now - new Date(lastSync).getTime() > 5 * 60 * 1000)) {
      console.log('بدء المزامنة عند التشغيل - آخر مزامنة قديمة');
      syncAllData(false).catch(console.error);
    }
  };
  
  // تنفيذ فحص المزامنة
  checkLastSync();
  
  // إضافة فحص دوري كل 10 دقائق
  const intervalId = setInterval(checkLastSync, 10 * 60 * 1000);
  
  // دالة التنظيف
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(intervalId);
  };
};

// دالة للتأكد من تحديث الإعدادات مع المستخدمين
export const broadcastSettingsUpdate = (): void => {
  // إضافة طابع زمني لإعلام جميع نوافذ المتصفح بالتغيير
  const timestamp = Date.now().toString();
  localStorage.setItem('settings_updated', timestamp);
  localStorage.setItem('bladi_info_update', timestamp);
};
