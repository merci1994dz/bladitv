
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
import { addForceRefreshMarkers } from './publish/updateMarkers';

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 */
export async function syncWithSupabase(forceRefresh: boolean = false): Promise<boolean> {
  console.log('بدء المزامنة مع Supabase، التحديث الإجباري = / Starting sync with Supabase, force refresh =', forceRefresh);
  
  // تعيين علامات التحديث الإجباري عند الحاجة
  if (forceRefresh) {
    addForceRefreshMarkers();
  }
  
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
    executionTimeout // زيادة المهلة على Vercel
  );
  
  // إضافة علامات التحديث بعد المزامنة الناجحة
  if (result) {
    try {
      const timestamp = Date.now().toString();
      localStorage.setItem('data_version', timestamp);
      localStorage.setItem('supabase_sync_version', timestamp);
      localStorage.setItem('supabase_sync_success', 'true');
      localStorage.setItem('last_update_check', timestamp);
      
      // إرسال حدث تحديث للمتصفح
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('app_data_updated'));
      } catch (e) {
        console.warn('فشل في إرسال حدث التحديث:', e);
      }
    } catch (e) {
      console.warn('فشل في تعيين علامات التحديث في التخزين المحلي:', e);
    }
  }
  
  return result || false;
}

// تصدير الدوال المهمة
export { setupSupabaseRealtimeSync as setupRealtimeSync };
export { initializeSupabaseTables };
