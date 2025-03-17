
import { supabase } from '@/integrations/supabase/client';
import { syncWithSupabase } from './syncOperations';

/**
 * الاشتراك للتحديثات في الوقت الحقيقي
 */
export const setupRealtimeSync = (): () => void => {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase...');
  try {
    const channelsSubscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' }, 
        async (payload) => {
          console.log('تم تلقي تحديث للقنوات في الوقت الحقيقي:', payload);
          await syncWithSupabase(true);
        }
      )
      .subscribe((status) => {
        console.log('حالة الاشتراك في تحديثات الوقت الحقيقي:', status);
      });
    
    return () => {
      console.log('إزالة الاشتراك في تحديثات الوقت الحقيقي');
      supabase.removeChannel(channelsSubscription);
    };
  } catch (error) {
    console.error('خطأ في إعداد المزامنة في الوقت الحقيقي:', error);
    return () => {
      // دالة تنظيف فارغة في حالة الخطأ
    };
  }
};
