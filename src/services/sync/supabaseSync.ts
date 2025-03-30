
/**
 * واجهة لمزامنة البيانات مع Supabase
 * Interface for syncing data with Supabase
 */

import { syncWithSupabaseUnified } from './core/unifiedSync';

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
    return await syncWithSupabaseUnified(forceRefresh);
  } catch (error) {
    console.error('فشل في مزامنة البيانات مع Supabase:', error);
    return false;
  }
};
