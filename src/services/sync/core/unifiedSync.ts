
/**
 * وظائف المزامنة الموحدة
 * Unified sync functions
 */

import { syncWithSupabase } from '../supabase/sync';
import { syncWithBladiInfo } from '../remote/sync/bladiInfoSync';
import { setSyncActive } from '../status';
import { updateLastSyncTime } from '../status/timestamp';

// خيارات المزامنة
interface SyncOptions {
  forceRefresh?: boolean;
  showNotifications?: boolean;
}

/**
 * المزامنة الموحدة مع جميع المصادر
 * Unified sync with all sources
 */
export const syncDataUnified = async (options?: SyncOptions): Promise<boolean> => {
  const forceRefresh = options?.forceRefresh ?? false;
  const showNotifications = options?.showNotifications ?? true;
  
  try {
    console.log('بدء المزامنة الموحدة...');
    
    // تعيين حالة المزامنة كنشطة
    setSyncActive(true);
    
    // أولاً، محاولة المزامنة مع Supabase
    console.log('محاولة المزامنة مع Supabase...');
    const supabaseResult = await syncWithSupabase(forceRefresh);
    
    if (supabaseResult) {
      console.log('تمت المزامنة بنجاح مع Supabase');
      updateLastSyncTime();
      setSyncActive(false);
      return true;
    }
    
    // إذا فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info
    console.log('فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info...');
    
    const bladiResult = await syncWithBladiInfo(forceRefresh);
    
    if (bladiResult) {
      console.log('تمت المزامنة بنجاح مع Bladi Info');
      updateLastSyncTime();
      setSyncActive(false);
      return true;
    }
    
    console.log('فشلت جميع محاولات المزامنة');
    setSyncActive(false);
    return false;
  } catch (error) {
    console.error('خطأ في المزامنة الموحدة:', error);
    setSyncActive(false);
    return false;
  }
};
