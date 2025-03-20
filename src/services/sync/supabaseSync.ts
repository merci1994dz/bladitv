
/**
 * عمليات المزامنة مع Supabase
 * Supabase synchronization operations
 */

import { supabase } from '@/integrations/supabase/client';
import { initializeSupabaseTables } from './supabase/initialize';
import { executeRetryableSync } from './core/retryableSync';
import { handleError } from '@/utils/errorHandling';
import { syncAllData } from './core/syncOperations';
import { setSyncTimestamp } from '@/services/sync/status/timestamp';
import { isRunningOnVercel, getVercelDeploymentInfo } from './remote/fetch/skewProtection';
import { toast } from '@/hooks/use-toast';

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 */
export async function syncWithSupabase(forceRefresh: boolean = false): Promise<boolean> {
  console.log('بدء المزامنة مع Supabase، التحديث الإجباري = / Starting sync with Supabase, force refresh =', forceRefresh);
  
  // على Vercel، تمديد فترة التنفيذ
  const isOnVercel = isRunningOnVercel();
  const executionTimeout = isOnVercel ? 30000 : 20000; // 30 ثانية على Vercel، 20 ثانية في غير ذلك
  
  const result = await executeRetryableSync(
    async () => {
      try {
        // تسجيل معلومات البيئة أولاً للمساعدة في التصحيح
        if (isOnVercel) {
          const deploymentInfo = getVercelDeploymentInfo();
          console.log("معلومات نشر Vercel:", deploymentInfo);
        }
        
        // التحقق من الاتصال بـ Supabase
        console.log("جاري التحقق من الاتصال بـ Supabase...");
        const { data, error } = await supabase.from('channels').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('خطأ في الاتصال بـ Supabase:', error);
          
          // محاولة تحديد سبب الخطأ
          if (error.code === 'PGRST301') {
            throw new Error('خطأ في مصادقة Supabase: ' + error.message);
          } else if (error.code?.includes('54')) {
            throw new Error('مهلة اتصال Supabase: ' + error.message);
          } else {
            throw error;
          }
        }
        
        console.log("تم الاتصال بـ Supabase بنجاح، جاري تنفيذ المزامنة...");
        
        // إذا نجح الاتصال، قم بتنفيذ المزامنة الكاملة
        const syncResult = await syncAllData(forceRefresh);
        
        if (syncResult) {
          const syncTimestamp = new Date().toISOString();
          setSyncTimestamp(syncTimestamp);
          
          // عرض إشعار للمستخدم بنجاح المزامنة
          toast({
            title: "تم المزامنة بنجاح",
            description: "تم تحديث البيانات من Supabase",
            duration: 3000,
          });
          
          // على Vercel، تخزين معلومات المزامنة الإضافية
          if (isOnVercel) {
            try {
              localStorage.setItem('vercel_sync_success', 'true');
              localStorage.setItem('vercel_last_sync', syncTimestamp);
              localStorage.setItem('vercel_sync_count', 
                (parseInt(localStorage.getItem('vercel_sync_count') || '0') + 1).toString());
            } catch (e) {
              console.warn("تعذر تخزين معلومات المزامنة على Vercel:", e);
            }
          }
        }
        
        return syncResult;
      } catch (error) {
        // استخدام طريقة أكثر تفصيلاً لمعالجة الأخطاء
        const appError = handleError(error, 'مزامنة Supabase / Supabase sync');
        
        // تسجيل تفاصيل الخطأ للتصحيح
        console.error("تفاصيل خطأ مزامنة Supabase:", {
          message: appError.message,
          type: appError.type,
          code: appError.code,
          retryable: appError.retryable,
          environment: isOnVercel ? 'Vercel' : 'غير Vercel'
        });
        
        throw error;
      }
    },
    'المزامنة مع Supabase / Sync with Supabase',
    true, // عملية حرجة / Critical operation
    executionTimeout // زيادة المهلة على Vercel
  );
  
  return result || false;
}

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 * Set up real-time sync with Supabase
 */
export function setupRealtimeSync(): () => void {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase / Setting up real-time sync with Supabase');
  
  try {
    // على Vercel، تسجيل هذه المعلومة
    if (isRunningOnVercel()) {
      try {
        localStorage.setItem('vercel_realtime_enabled', 'true');
        localStorage.setItem('vercel_realtime_setup', new Date().toISOString());
      } catch (e) {
        // تجاهل أخطاء التخزين
      }
    }
    
    // تخصيص تكوين القناة استنادًا إلى البيئة - ضمان وجود خاصية config دائمًا لتلبية متطلبات RealtimeChannelOptions
    const channelOptions = {
      config: {
        broadcast: { 
          ack: isRunningOnVercel() ? true : false
        }
      }
    };
    
    // الاشتراك في تغييرات الجداول المختلفة
    const channelsSubscription = supabase
      .channel('public:channels', channelOptions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, payload => {
        console.log('تم استلام تغيير في قناة في الوقت الحقيقي: / Received real-time channel change:', payload);
        
        // عرض إشعار للمستخدم
        toast({
          title: "تحديث في الوقت الحقيقي",
          description: "تم تحديث بيانات القنوات",
          duration: 3000
        });
        
        // تسجيل حدث المزامنة إذا كان على Vercel
        if (isRunningOnVercel()) {
          try {
            localStorage.setItem('vercel_realtime_update', new Date().toISOString());
            localStorage.setItem('vercel_realtime_count', 
              (parseInt(localStorage.getItem('vercel_realtime_count') || '0') + 1).toString());
          } catch (e) {
            // تجاهل أخطاء التخزين
          }
        }
      })
      .subscribe((status) => {
        console.log('حالة اشتراك قناة القنوات:', status);
      });
    
    const settingsSubscription = supabase
      .channel('public:settings', channelOptions) // استخدام نفس خيارات القناة
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, payload => {
        console.log('تم استلام تغيير في الإعدادات في الوقت الحقيقي: / Received real-time settings change:', payload);
        
        // عرض إشعار للمستخدم
        toast({
          title: "تحديث الإعدادات",
          description: "تم تحديث إعدادات التطبيق",
          duration: 3000
        });
      })
      .subscribe();
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      console.log("إلغاء اشتراكات المزامنة في الوقت الحقيقي");
      channelsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
      
      // تحديث حالة الاشتراك في الوقت الحقيقي على Vercel
      if (isRunningOnVercel()) {
        try {
          localStorage.setItem('vercel_realtime_enabled', 'false');
          localStorage.setItem('vercel_realtime_unsubscribed', new Date().toISOString());
        } catch (e) {
          // تجاهل أخطاء التخزين
        }
      }
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي / Setting up real-time sync');
    // إرجاع دالة فارغة في حالة الخطأ
    return () => {};
  }
}

// تصدير دالة تهيئة Supabase
export { initializeSupabaseTables };
