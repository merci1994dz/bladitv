
/**
 * عمليات المزامنة مع Supabase
 * Supabase synchronization operations
 */

import { initializeSupabaseTables } from './supabase/initialize';
import { executeRetryableSync } from './core/retryableSync';
import { isRunningOnVercel } from './remote/fetch/skewProtection';
import { performSupabaseSync } from './supabase/sync/syncCore';
import { setupSupabaseRealtimeSync } from './supabase/realtime/realtimeSync';
import { handleSupabaseError } from './supabase/syncErrorHandler';

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
        return await performSupabaseSync(forceRefresh);
      } catch (error) {
        // معالجة الخطأ باستخدام معالج الأخطاء المتخصص
        await handleSupabaseError(error);
        throw error;
      }
    },
    'المزامنة مع Supabase / Sync with Supabase',
    true, // عملية حرجة / Critical operation
    executionTimeout // زيادة المهلة على Vercel
  );
  
  return result || false;
}

// تصدير الدوال المهمة
export { setupSupabaseRealtimeSync as setupRealtimeSync };
export { initializeSupabaseTables };
