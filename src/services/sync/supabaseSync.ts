
/**
 * عمليات المزامنة مع Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { initializeSupabaseTables } from './supabase/initialize';
import { executeRetryableSync } from './core/retryableSync';
import { handleError } from '@/utils/errorHandling';
import { syncAllData } from './core/syncOperations';
import { setSyncTimestamp } from './status';

/**
 * مزامنة البيانات مع Supabase
 */
export async function syncWithSupabase(forceRefresh: boolean = false): Promise<boolean> {
  console.log('بدء المزامنة مع Supabase، التحديث الإجباري =', forceRefresh);
  
  const result = await executeRetryableSync(
    async () => {
      try {
        // التحقق من الاتصال بـ Supabase
        const { data, error } = await supabase.from('channels').select('count', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        // إذا نجح الاتصال، قم بتنفيذ المزامنة الكاملة
        const syncResult = await syncAllData(forceRefresh);
        
        if (syncResult) {
          setSyncTimestamp(new Date().toISOString());
        }
        
        return syncResult;
      } catch (error) {
        handleError(error, 'مزامنة Supabase');
        throw error;
      }
    },
    'المزامنة مع Supabase',
    true // عملية حرجة
  );
  
  return result || false;
}

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 */
export function setupRealtimeSync(): () => void {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase');
  
  try {
    // الاشتراك في تغييرات الجداول المختلفة
    const channelsSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, payload => {
        console.log('تم استلام تغيير في قناة في الوقت الحقيقي:', payload);
        // هنا يمكنك تنفيذ تحديث فوري للواجهة أو تحديث التخزين المؤقت
      })
      .subscribe();
    
    const settingsSubscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, payload => {
        console.log('تم استلام تغيير في الإعدادات في الوقت الحقيقي:', payload);
        // هنا يمكنك تنفيذ تحديث فوري للواجهة أو تحديث التخزين المؤقت
      })
      .subscribe();
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      channelsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي');
    // إرجاع دالة فارغة في حالة الخطأ
    return () => {};
  }
}

// تصدير دالة تهيئة Supabase
export { initializeSupabaseTables };
