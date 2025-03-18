
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

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 */
export async function syncWithSupabase(forceRefresh: boolean = false): Promise<boolean> {
  console.log('بدء المزامنة مع Supabase، التحديث الإجباري = / Starting sync with Supabase, force refresh =', forceRefresh);
  
  const result = await executeRetryableSync(
    async () => {
      try {
        // التحقق من الاتصال بـ Supabase
        // Check connection to Supabase
        const { data, error } = await supabase.from('channels').select('count', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        // إذا نجح الاتصال، قم بتنفيذ المزامنة الكاملة
        // If connection successful, execute full sync
        const syncResult = await syncAllData(forceRefresh);
        
        if (syncResult) {
          setSyncTimestamp(new Date().toISOString());
        }
        
        return syncResult;
      } catch (error) {
        handleError(error, 'مزامنة Supabase / Supabase sync');
        throw error;
      }
    },
    'المزامنة مع Supabase / Sync with Supabase',
    true // عملية حرجة / Critical operation
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
    // الاشتراك في تغييرات الجداول المختلفة
    // Subscribe to changes in different tables
    const channelsSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, payload => {
        console.log('تم استلام تغيير في قناة في الوقت الحقيقي: / Received real-time channel change:', payload);
        // هنا يمكنك تنفيذ تحديث فوري للواجهة أو تحديث التخزين المؤقت
        // Here you can implement immediate UI update or cache update
      })
      .subscribe();
    
    const settingsSubscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, payload => {
        console.log('تم استلام تغيير في الإعدادات في الوقت الحقيقي: / Received real-time settings change:', payload);
        // هنا يمكنك تنفيذ تحديث فوري للواجهة أو تحديث التخزين المؤقت
        // Here you can implement immediate UI update or cache update
      })
      .subscribe();
    
    // إرجاع دالة لإلغاء الاشتراك
    // Return function to unsubscribe
    return () => {
      channelsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي / Setting up real-time sync');
    // إرجاع دالة فارغة في حالة الخطأ
    // Return empty function in case of error
    return () => {};
  }
}

// تصدير دالة تهيئة Supabase
// Export Supabase initialization function
export { initializeSupabaseTables };
