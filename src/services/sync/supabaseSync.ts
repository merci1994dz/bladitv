
/**
 * واجهة لمزامنة البيانات مع Supabase
 * Interface for syncing data with Supabase
 */

import { syncDataUnified } from './core/unifiedSync';
// Import functions directly from their source modules
import { setupSupabaseRealtimeSync } from './supabase/realtime/realtimeSync';
import { initializeSupabaseTables } from './supabase/initialize';

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 * 
 * @param forceRefresh فرض التحديث بغض النظر عن التخزين المؤقت
 * @returns وعد بنتيجة العملية
 */
export const syncWithSupabase = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('بدء مزامنة البيانات مع Supabase، الوضع الإجباري =', forceRefresh);
    return await syncDataUnified({forceRefresh});
  } catch (error) {
    console.error('فشل في مزامنة البيانات مع Supabase:', error);
    return false;
  }
};

// Export functions directly to avoid import confusion
export { setupSupabaseRealtimeSync, initializeSupabaseTables };

// Re-export the checkBladiInfoAvailability function for convenience
export { checkBladiInfoAvailability } from './remote/sync/sourceAvailability';
