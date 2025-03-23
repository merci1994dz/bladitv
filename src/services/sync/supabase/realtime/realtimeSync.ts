
/**
 * المزامنة في الوقت الحقيقي مع Supabase
 * Real-time sync with Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';
import { isRunningOnVercel } from '../../remote/fetch/skewProtection';

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 * Set up real-time sync with Supabase
 * 
 * @returns دالة لإلغاء الاشتراك
 */
export const setupSupabaseRealtimeSync = (): () => void => {
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
};
