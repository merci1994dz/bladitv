
/**
 * المزامنة في الوقت الحقيقي مع Supabase
 * Real-time sync with Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 * Set up real-time sync with Supabase
 * 
 * @returns دالة لإلغاء الاشتراك
 */
export const setupSupabaseRealtimeSync = (): () => void => {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase / Setting up real-time sync with Supabase');
  
  try {
    // تخصيص تكوين القناة - ضمان وجود خاصية config دائمًا لتلبية متطلبات RealtimeChannelOptions
    const channelOptions = {
      config: {
        broadcast: { 
          ack: false // تعطيل إقرار البث 
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
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي / Setting up real-time sync');
    // إرجاع دالة فارغة في حالة الخطأ
    return () => {};
  }
};
