
/**
 * إدارة حالة المزامنة
 * Sync state management
 */

// حالة المزامنة الحالية
// Current sync state
let syncActive = false;

/**
 * تعيين ما إذا كانت المزامنة نشطة
 * Set whether sync is active
 */
export const setSyncActive = (active: boolean) => {
  syncActive = active;
};

/**
 * التحقق مما إذا كانت المزامنة قيد التقدم
 * Check if sync is in progress
 */
export const isSyncInProgress = (): boolean => {
  return syncActive;
};

/**
 * الحصول على حالة المزامنة
 * Get sync status
 */
export const getSyncStatus = () => {
  const lastSyncTimeStr = localStorage.getItem('last_sync_time');
  const lastSyncTime = lastSyncTimeStr ? new Date(lastSyncTimeStr) : null;
  
  return {
    active: syncActive,
    lastSync: lastSyncTime,
    lastSyncFormatted: lastSyncTime ? lastSyncTime.toLocaleString() : 'لم تتم المزامنة بعد'
  };
};
