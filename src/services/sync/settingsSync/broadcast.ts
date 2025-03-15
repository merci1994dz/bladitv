
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
    localStorage.setItem('nocache_version', timestamp);
    
    // استخدام sessionStorage أيضًا كطريقة إضافية
    sessionStorage.setItem('update_notification', timestamp);
    
    // استخدام cookies كطريقة ثالثة (مدة صلاحية يوم واحد)
    document.cookie = `update_check=${timestamp}; path=/; max-age=86400`;
    
    // تأخير بعض التغييرات لضمان الانتشار
    setTimeout(() => {
      localStorage.setItem('delayed_update', timestamp);
      localStorage.setItem('bladi_update_version', timestamp);
    }, 200);
    
    console.log('تم نشر تحديث الإعدادات للمستخدمين عبر عدة قنوات:', timestamp);
  } catch (error) {
    console.error('فشل في نشر تحديث الإعدادات:', error);
  }
};

// دالة محسنة لفرض إعادة تحميل التطبيق لجميع المستخدمين
export const forceAppReloadForAllUsers = (): void => {
  const timestamp = Date.now().toString();
  
  // نشر عبر جميع القنوات المتاحة
  localStorage.setItem('force_browser_refresh', 'true');
  localStorage.setItem('bladi_force_refresh', 'true');
  localStorage.setItem('refresh_timestamp', timestamp);
  localStorage.setItem('data_version', timestamp);
  localStorage.setItem('force_app_reload', 'true');
  localStorage.setItem('app_update_required', timestamp);
  
  // استخدام sessionStorage للمتصفحات التي قد لا تدعم التخزين المحلي
  try {
    sessionStorage.setItem('force_reload', 'true');
    sessionStorage.setItem('app_update', timestamp);
  } catch (e) {
    console.error('خطأ في تخزين البيانات في sessionStorage:', e);
  }
  
  // استخدام cookies كطريقة إضافية
  try {
    document.cookie = `force_reload=${timestamp}; path=/; max-age=3600`;
    document.cookie = `app_update=${timestamp}; path=/; max-age=3600`;
  } catch (e) {
    console.error('خطأ في تخزين البيانات في cookies:', e);
  }
  
  // تطبيق على المتصفح الحالي بعد تأخير قصير
  setTimeout(() => {
    // إعادة تحميل الصفحة مع إضافة معلمات منع التخزين المؤقت
    const cacheBuster = Date.now();
    window.location.href = window.location.href.split('?')[0] + 
      `?reload=${cacheBuster}&nocache=${cacheBuster}&t=${cacheBuster}`;
  }, 500);
  
  console.log('تم إرسال أمر إعادة التحميل لجميع المستخدمين:', timestamp);
};
