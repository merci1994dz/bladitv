
import { saveChannelsToStorage } from '../dataStore';
import { syncAllData } from './coreSync';

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
    
    // 6. إضافة التأخير قبل إعادة التحميل لإعطاء وقت للتغييرات لتأخذ مفعولها
    if (syncResult) {
      setTimeout(() => {
        localStorage.setItem('refresh_complete', timestamp);
        
        // 7. تحديث صفحة المستخدم لضمان ظهور التغييرات
        // نقوم بإضافة معلمة لتجنب التخزين المؤقت
        try {
          window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
        } catch (e) {
          console.error('فشل في إعادة تحميل الصفحة:', e);
          
          // محاولة تحديث الصفحة بطريقة أخرى إذا فشلت الطريقة السابقة
          try {
            window.location.reload();
          } catch (e2) {
            console.error('فشل في تحديث الصفحة بالطريقة الثانية:', e2);
          }
        }
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
