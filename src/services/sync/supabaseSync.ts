
/**
 * عمليات المزامنة مع Supabase
 * Supabase synchronization operations
 */

import { initializeSupabaseTables } from './supabase/initialize';
import { isRunningOnVercel } from './remote/fetch/skewProtection';
import { handleSupabaseError } from './supabase/syncErrorHandler';
import { addForceRefreshMarkers } from './publish/updateMarkers';
import { syncWithSupabaseUnified } from './core/unifiedSync';
import { setupSupabaseRealtimeSync } from './supabase/realtime/realtimeSync';

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
  
  try {
    // استخدام وظيفة المزامنة الموحدة
    return await syncWithSupabaseUnified(forceRefresh);
  } catch (error) {
    // معالجة الخطأ باستخدام معالج الأخطاء المتخصص
    await handleSupabaseError(error);
    throw error;
  }
}

// تصدير الدوال المهمة
export { setupSupabaseRealtimeSync as setupRealtimeSync };
export { initializeSupabaseTables };
export { syncWithSupabaseUnified };
