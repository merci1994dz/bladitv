
/**
 * وظيفة مزامنة موحدة للتعامل مع جميع مصادر المزامنة
 * Unified sync function to handle all sync sources
 */

import { checkSourceAvailability } from './sourceCheck';
import { syncWithSupabase } from '../supabase/operations/dataSync';
import { syncWithBladiInfo } from '../remote/sync/bladiInfoSync';
import { updateLastSyncTime } from '../config';
import { setSyncTimestamp } from '../status/timestamp';

// Export the main function for use in other modules
export const syncWithSupabaseUnified = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('بدء مزامنة البيانات مع Supabase بشكل موحد...');
    
    // Try syncing with Supabase first
    const supabaseResult = await syncWithSupabase(forceRefresh);
    
    if (supabaseResult) {
      console.log('تمت المزامنة بنجاح مع Supabase');
      return true;
    }
    
    // If Supabase sync fails, try syncing with Bladi Info
    console.log('محاولة المزامنة مع مصادر Bladi Info...');
    const bladiResult = await syncWithBladiInfo(forceRefresh);
    
    if (bladiResult) {
      console.log('تمت المزامنة بنجاح مع مصادر Bladi Info');
      return true;
    }
    
    console.warn('فشلت جميع محاولات المزامنة');
    return false;
  } catch (error) {
    console.error('خطأ في المزامنة الموحدة:', error);
    return false;
  } finally {
    // Update sync timestamp
    updateLastSyncTime();
    setSyncTimestamp(new Date().toISOString());
  }
};

// Additional utility function that can be used to sync data with options
export const syncDataUnified = async (options: {
  forceRefresh?: boolean;
  showNotifications?: boolean;
} = {}): Promise<boolean> => {
  const { forceRefresh = false, showNotifications = true } = options;
  
  try {
    return await syncWithSupabaseUnified(forceRefresh);
  } catch (error) {
    console.error('خطأ في مزامنة البيانات:', error);
    return false;
  }
};

// Get sync status information
export const getSyncStatus = () => {
  return {
    lastSyncTime: localStorage.getItem('last_sync_time') || null,
    syncCount: Number(localStorage.getItem('sync_count') || '0'),
    lastSource: localStorage.getItem('last_sync_source') || null
  };
};
