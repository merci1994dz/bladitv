/**
 * واجهة موحدة للمزامنة للاستخدام في واجهة المستخدم
 * Unified sync interface for UI usage
 */

import { syncAllData } from './syncOperations';
import { syncState } from './syncState';
import { checkSourceAvailability } from './sourceCheck';
import { getSkewProtectionParams } from '../remote/fetch/skewProtection';

interface SyncOptions {
  forceRefresh?: boolean;
  showNotifications?: boolean;
  timeout?: number;
}

interface SyncStatus {
  lastSyncTime: string | null;
  isSuccessful: boolean;
  lastError: string | null;
  inProgress: boolean;
  availableSource: string | null;
}

// تخزين حالة المزامنة
const syncStatus: SyncStatus = {
  lastSyncTime: null,
  isSuccessful: false,
  lastError: null,
  inProgress: false,
  availableSource: null
};

/**
 * الحصول على حالة المزامنة الحالية
 * Get current sync status
 */
export const getSyncStatus = (): SyncStatus => {
  try {
    // محاولة قراءة معلومات المزامنة من التخزين المحلي
    const lastSyncTime = localStorage.getItem('last_sync_time') || null;
    const isSuccessful = localStorage.getItem('last_sync_success') === 'true';
    const lastError = localStorage.getItem('last_sync_error') || null;
    
    // تحديث حالة المزامنة بناءً على التخزين المحلي
    syncStatus.lastSyncTime = lastSyncTime;
    syncStatus.isSuccessful = isSuccessful;
    syncStatus.lastError = lastError;
    syncStatus.inProgress = syncState.syncInProgress;
    
    return { ...syncStatus };
  } catch (e) {
    // إذا فشلت قراءة التخزين المحلي، استخدم القيم المخزنة في الذاكرة
    return { ...syncStatus };
  }
};

/**
 * وظيفة المزامنة الموحدة للاستخدام في واجهة المستخدم
 * Unified sync function for UI usage
 */
export const syncDataUnified = async (options: SyncOptions = {}): Promise<boolean> => {
  const {
    forceRefresh = false,
    showNotifications = false,
    timeout = 30000
  } = options;
  
  if (syncStatus.inProgress) {
    console.warn('جاري تنفيذ المزامنة بالفعل، تجاهل هذا الطلب');
    return false;
  }
  
  syncStatus.inProgress = true;
  
  try {
    // تحديث حالة المزامنة
    console.log('بدء المزامنة الموحدة، الوضع الإجباري =', forceRefresh);
    
    // التحقق من توفر المصادر
    syncStatus.availableSource = await checkSourceAvailability();
    
    // تنفيذ المزامنة مع معلمات إضافية
    const skewParam = getSkewProtectionParams();
    const success = await syncAllData(forceRefresh);
    
    // تحديث حالة المزامنة
    syncStatus.isSuccessful = success;
    syncStatus.lastError = success ? null : 'فشلت المزامنة';
    
    if (success) {
      syncStatus.lastSyncTime = new Date().toISOString();
      
      // حفظ حالة المزامنة في التخزين المحلي
      try {
        localStorage.setItem('last_sync_time', syncStatus.lastSyncTime);
        localStorage.setItem('last_sync_success', 'true');
        localStorage.removeItem('last_sync_error');
      } catch (e) {
        console.error('فشل في تخزين حالة المزامنة:', e);
      }
      
      // إطلاق حدث تحديث البيانات
      try {
        window.dispatchEvent(new CustomEvent('app_data_updated'));
      } catch (e) {
        console.warn('فشل في إطلاق حدث تحديث البيانات:', e);
      }
    } else {
      // حفظ معلومات الفشل
      try {
        localStorage.setItem('last_sync_success', 'false');
        localStorage.setItem('last_sync_failure', Date.now().toString());
      } catch (e) {
        console.error('فشل في تخزين معلومات فشل المزامنة:', e);
      }
    }
    
    return success;
  } catch (error) {
    console.error('خطأ غير متوقع أثناء المزامنة الموحدة:', error);
    
    syncStatus.isSuccessful = false;
    syncStatus.lastError = error instanceof Error ? error.message : String(error);
    
    // حفظ معلومات الخطأ
    try {
      localStorage.setItem('last_sync_success', 'false');
      localStorage.setItem('last_sync_error', syncStatus.lastError);
    } catch (e) {
      console.error('فشل في تخزين معلومات خطأ المزامنة:', e);
    }
    
    return false;
  } finally {
    syncStatus.inProgress = false;
  }
};

/**
 * واجهة لمزامنة Supabase - تستخدم وظيفة المزامنة الموحدة
 * Interface for Supabase sync - uses the unified sync function
 */
export const syncWithSupabaseUnified = async (forceRefresh: boolean = false): Promise<boolean> => {
  return await syncDataUnified({ 
    forceRefresh, 
    showNotifications: false,
    timeout: 30000
  });
};
