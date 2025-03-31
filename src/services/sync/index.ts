
/**
 * نقطة الدخول الرئيسية لخدمات المزامنة
 * Main entry point for sync services
 */

// تصدير الوظائف الأساسية من ملفات أخرى
// Export core functions from other files
export { syncWithSupabase, initializeSupabaseTables } from './supabaseSync';
export { syncWithBladiInfo, checkBladiInfoAvailability } from './remoteSync';
export { forceDataRefresh, clearPageCache } from './forceRefresh';

// خدمة المزامنة الموحدة
// Unified sync service
export const syncData = async (forceRefresh = false): Promise<boolean> => {
  console.log('بدء المزامنة الموحدة...');
  
  try {
    // أولاً، محاولة المزامنة مع Supabase
    // First, try to sync with Supabase
    const { syncWithSupabase } = await import('./supabaseSync');
    const supabaseResult = await syncWithSupabase(forceRefresh);
    
    if (supabaseResult) {
      console.log('تمت المزامنة بنجاح مع Supabase');
      return true;
    }
    
    // إذا فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info
    // If Supabase sync fails, try syncing with Bladi Info
    console.log('فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info...');
    
    const { syncWithBladiInfo } = await import('./remoteSync');
    const bladiResult = await syncWithBladiInfo(forceRefresh);
    
    if (bladiResult.updated) {
      console.log('تمت المزامنة بنجاح مع Bladi Info');
      return true;
    }
    
    console.log('فشلت جميع محاولات المزامنة');
    return false;
  } catch (error) {
    console.error('خطأ في المزامنة الموحدة:', error);
    return false;
  }
};
