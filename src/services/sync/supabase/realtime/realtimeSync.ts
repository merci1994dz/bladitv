
/**
 * المزامنة في الوقت الحقيقي مع Supabase
 * Real-time sync with Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';
import { syncWithSupabase } from '../syncOperations';

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 * Set up real-time sync with Supabase
 * 
 * @returns دالة لإلغاء الاشتراك
 */
export const setupSupabaseRealtimeSync = (): () => void => {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase / Setting up real-time sync with Supabase');
  
  try {
    // تخصيص تكوين القناة مع خيارات مناسبة
    const channelOptions = {
      config: {
        broadcast: { 
          ack: true, // تمكين الإقرار للتحقق من وصول الرسائل
          self: false // لا ترسل الأحداث للمشترك نفسه
        }
      }
    };
    
    // الاشتراك في تغييرات جدول القنوات
    const channelsSubscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' }, 
        async (payload) => {
          console.log('تم استلام تغيير في قناة في الوقت الحقيقي: / Received real-time channel change:', payload);
          
          // تحديث البيانات المحلية
          try {
            await syncWithSupabase(true);
            
            // عرض إشعار للمستخدم
            toast({
              title: "تحديث في الوقت الحقيقي",
              description: "تم تحديث بيانات القنوات",
              duration: 3000
            });
          } catch (error) {
            console.error('فشل في تحديث البيانات المحلية بعد تغيير في الوقت الحقيقي:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('حالة اشتراك قناة القنوات:', status);
      });
    
    // الاشتراك في تغييرات جدول الإعدادات
    const settingsSubscription = supabase
      .channel('public:settings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'settings' }, 
        async (payload) => {
          console.log('تم استلام تغيير في الإعدادات في الوقت الحقيقي: / Received real-time settings change:', payload);
          
          // عرض إشعار للمستخدم
          toast({
            title: "تحديث الإعدادات",
            description: "تم تحديث إعدادات التطبيق",
            duration: 3000
          });
        }
      )
      .subscribe();
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      console.log("إلغاء اشتراكات المزامنة في الوقت الحقيقي");
      supabase.removeChannel(channelsSubscription);
      supabase.removeChannel(settingsSubscription);
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي / Setting up real-time sync');
    // إرجاع دالة فارغة في حالة الخطأ
    return () => {};
  }
};
