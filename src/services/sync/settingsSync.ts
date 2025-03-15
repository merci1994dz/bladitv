
import { syncAllData, forceDataRefresh, getLastSyncTime } from './index';

// دالة إعداد مستمع للتغييرات في البيانات - محسّنة
export const setupSettingsListener = (): (() => void) => {
  console.log('بدء تهيئة مستمع التغييرات للبيانات بالآلية المحسّنة');
  
  // قائمة بالمفاتيح التي يجب مراقبتها للتغييرات
  const syncTriggerKeys = [
    'tv_channels',
    'bladi_info_update',
    'data_version',
    'force_browser_refresh',
    'force_refresh',
    'channels_last_update',
    'channels_updated_at',
    'bladi_update_version',
    'bladi_update_channels',
    'bladi_force_refresh',
    'settings_updated',
    'refresh_timestamp',
    'update_notification',
    'delayed_update',
    'final_update_check'
  ];
  
  // معالج التغييرات في التخزين المحلي - محسّن لاكتشاف المزيد من التغييرات
  const handleStorageChange = (event: StorageEvent) => {
    // التحقق إذا كان المفتاح المتغير أحد المفاتيح المهمة
    if (event.key && syncTriggerKeys.includes(event.key)) {
      console.log(`تم اكتشاف تغيير في: ${event.key}، إعادة تحميل البيانات...`);
      
      // إذا كان التغيير يتطلب إعادة تحميل كاملة للصفحة
      if (
        (event.key === 'force_browser_refresh' && event.newValue === 'true') ||
        (event.key === 'bladi_force_refresh' && event.newValue === 'true')
      ) {
        console.log('تم طلب إعادة تحميل الصفحة، جاري التنفيذ...');
        
        // إضافة تأخير صغير للتأكد من استكمال أي عمليات حفظ
        setTimeout(() => {
          // إعادة تحميل الصفحة مع منع التخزين المؤقت
          window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
        }, 300);
        return;
      }
      
      // تحديث البيانات دون إعادة تحميل الصفحة
      syncAllData(false).catch(err => {
        console.error('خطأ في تحديث البيانات بعد التغيير:', err);
      });
    }
  };
  
  // نسخة محسّنة من معالج التغييرات - يتم تنفيذها بمهلة زمنية لتجنب التحديثات المتكررة
  let debounceTimer: number | null = null;
  const debouncedHandleStorage = (event: StorageEvent) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = window.setTimeout(() => {
      handleStorageChange(event);
    }, 300);
  };
  
  // تفعيل الاستماع للتغييرات مع استخدام النسخة المحسّنة من المعالج
  window.addEventListener('storage', debouncedHandleStorage);
  
  // مزامنة البيانات عند بدء التشغيل مع تحسين منطق الفحص
  const checkLastSync = () => {
    const lastSync = getLastSyncTime();
    const now = Date.now();
    
    // تحقق أيضًا من البيانات المخزنة مؤقتًا إذا تم تعديلها
    const lastChannelsUpdate = localStorage.getItem('channels_last_update');
    const lastDataVersion = localStorage.getItem('data_version');
    
    // إذا لم يكن هناك مزامنة سابقة أو مر وقت طويل على آخر مزامنة (5 دقائق)
    // أو تم تغيير البيانات منذ آخر مزامنة
    if (!lastSync || 
        (now - new Date(lastSync).getTime() > 5 * 60 * 1000) || 
        (lastChannelsUpdate && lastSync && new Date(lastChannelsUpdate).getTime() > new Date(lastSync).getTime()) ||
        (lastDataVersion && lastSync && new Date(lastDataVersion).getTime() > new Date(lastSync).getTime())) {
      console.log('بدء المزامنة عند التشغيل - تم اكتشاف تغييرات أو مزامنة قديمة');
      syncAllData(false).catch(console.error);
    }
  };
  
  // تنفيذ فحص المزامنة عند التهيئة
  checkLastSync();
  
  // إضافة فحص دوري كل 5 دقائق (تم تقليله من 10 دقائق لزيادة التفاعلية)
  const intervalId = setInterval(checkLastSync, 5 * 60 * 1000);
  
  // إضافة مستمع للتركيز - تحديث البيانات عند العودة إلى التبويب
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('تم اكتشاف العودة إلى التبويب، جاري التحقق من التحديثات...');
      checkLastSync();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // دالة التنظيف - إزالة جميع المستمعين عند إزالة المكون
  return () => {
    window.removeEventListener('storage', debouncedHandleStorage);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(intervalId);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
};

// دالة محسّنة للتأكد من تحديث الإعدادات مع المستخدمين
export const broadcastSettingsUpdate = (): void => {
  // إضافة طابع زمني لإعلام جميع نوافذ المتصفح بالتغيير
  const timestamp = Date.now().toString();
  
  // محاولة استخدام عدة طرق للنشر للتوافق مع مختلف المتصفحات
  try {
    // استخدام localStorage - الطريقة الأساسية
    localStorage.setItem('settings_updated', timestamp);
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('data_version', timestamp);
    
    // استخدام sessionStorage أيضًا كطريقة إضافية
    sessionStorage.setItem('update_notification', timestamp);
    
    // استخدام cookies كطريقة ثالثة (مدة صلاحية يوم واحد)
    document.cookie = `update_check=${timestamp}; path=/; max-age=86400`;
    
    // تأخير بعض التغييرات لضمان الانتشار
    setTimeout(() => {
      localStorage.setItem('delayed_update', timestamp);
      localStorage.setItem('bladi_update_version', timestamp);
    }, 500);
    
    console.log('تم نشر تحديث الإعدادات للمستخدمين عبر عدة قنوات:', timestamp);
  } catch (error) {
    console.error('فشل في نشر تحديث الإعدادات:', error);
  }
};

// دالة جديدة لفرض إعادة تحميل التطبيق لجميع المستخدمين
export const forceAppReloadForAllUsers = (): void => {
  const timestamp = Date.now().toString();
  
  // نشر عبر عدة قنوات
  localStorage.setItem('force_browser_refresh', 'true');
  localStorage.setItem('bladi_force_refresh', 'true');
  localStorage.setItem('refresh_timestamp', timestamp);
  localStorage.setItem('data_version', timestamp);
  sessionStorage.setItem('force_reload', 'true');
  
  // تطبيق على المتصفح الحالي بعد تأخير قصير
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  console.log('تم إرسال أمر إعادة التحميل لجميع المستخدمين:', timestamp);
};

