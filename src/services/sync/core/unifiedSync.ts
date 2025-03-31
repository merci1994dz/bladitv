
/**
 * وظائف المزامنة الموحدة
 * Unified sync functions
 */

import { syncWithSupabase } from '../supabaseSync';
import { syncWithBladiInfo } from '../remote/sync/bladiInfoSync';
import { setSyncActive } from '../status';
import { setSyncTimestamp } from '../status/timestamp';

// خيارات المزامنة
interface SyncOptions {
  forceRefresh?: boolean;
  showNotifications?: boolean;
}

// واجهة حالة المزامنة
interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  hasError: boolean;
  errorMessage?: string;
}

// حالة المزامنة الافتراضية
const syncStatus: SyncStatus = {
  isSyncing: false,
  lastSyncTime: null,
  hasError: false
};

/**
 * الحصول على حالة المزامنة
 * Get sync status
 */
export const getSyncStatus = (): SyncStatus => {
  return { ...syncStatus };
};

/**
 * المزامنة المباشرة مع Supabase
 * Direct sync with Supabase
 */
export const syncWithSupabaseUnified = async (forceRefresh = false): Promise<boolean> => {
  try {
    syncStatus.isSyncing = true;
    setSyncActive(true);
    
    // محاولة المزامنة مع Supabase
    const result = await syncWithSupabase(forceRefresh);
    
    if (result) {
      setSyncTimestamp();
      syncStatus.lastSyncTime = new Date().toISOString();
    }
    
    return result;
  } catch (error) {
    console.error('خطأ في المزامنة المباشرة مع Supabase:', error);
    syncStatus.hasError = true;
    syncStatus.errorMessage = error instanceof Error ? error.message : String(error);
    return false;
  } finally {
    syncStatus.isSyncing = false;
    setSyncActive(false);
  }
};

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
    syncStatus.isSyncing = true;
    setSyncActive(true);
    
    // أولاً، محاولة المزامنة مع Supabase
    console.log('محاولة المزامنة مع Supabase...');
    const supabaseResult = await syncWithSupabase(forceRefresh);
    
    if (supabaseResult) {
      console.log('تمت المزامنة بنجاح مع Supabase');
      setSyncTimestamp();
      syncStatus.lastSyncTime = new Date().toISOString();
      syncStatus.isSyncing = false;
      setSyncActive(false);
      return true;
    }
    
    // إذا فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info
    console.log('فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info...');
    
    const bladiResult = await syncWithBladiInfo(forceRefresh);
    
    if (bladiResult) {
      console.log('تمت المزامنة بنجاح مع Bladi Info');
      setSyncTimestamp();
      syncStatus.lastSyncTime = new Date().toISOString();
      syncStatus.isSyncing = false;
      setSyncActive(false);
      return true;
    }
    
    console.log('فشلت جميع محاولات المزامنة');
    syncStatus.isSyncing = false;
    setSyncActive(false);
    return false;
  } catch (error) {
    console.error('خطأ في المزامنة الموحدة:', error);
    syncStatus.hasError = true;
    syncStatus.errorMessage = error instanceof Error ? error.message : String(error);
    syncStatus.isSyncing = false;
    setSyncActive(false);
    return false;
  }
};
