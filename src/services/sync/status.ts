
/**
 * إدارة حالة المزامنة
 * Manage sync status
 */

// حالة المزامنة الحالية
// Current sync status
let syncActive = false;
let syncTimestamp: string | null = null;

/**
 * تعيين حالة المزامنة
 * Set sync status
 * 
 * @param active ما إذا كانت المزامنة نشطة
 */
export const setSyncActive = (active: boolean) => {
  syncActive = active;
  
  // حفظ الحالة في التخزين المحلي للمشاركة بين علامات التبويب
  // Save status in localStorage for sharing between tabs
  try {
    localStorage.setItem('sync_active', active ? 'true' : 'false');
    if (active) {
      localStorage.setItem('sync_started', new Date().toISOString());
    } else {
      localStorage.setItem('sync_ended', new Date().toISOString());
    }
  } catch (e) {
    // تجاهل أي أخطاء تخزين
    // Ignore any storage errors
  }
  
  // إرسال حدث للمكونات المشتركة للإعلام بتغير حالة المزامنة
  // Send event to shared components to notify of sync status change
  try {
    const syncEvent = new CustomEvent('sync-status-change', { 
      detail: { active, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(syncEvent);
  } catch (e) {
    // تجاهل أي أخطاء مرتبطة بأحداث مخصصة
    // Ignore any custom event related errors
  }
};

/**
 * الحصول على حالة المزامنة
 * Get sync status
 * 
 * @returns ما إذا كانت المزامنة نشطة
 */
export const isSyncActive = (): boolean => {
  return syncActive;
};

/**
 * تعيين طابع زمني للمزامنة
 * Set sync timestamp
 * 
 * @param timestamp الطابع الزمني للمزامنة
 */
export const setSyncTimestamp = (timestamp: string) => {
  syncTimestamp = timestamp;
};

/**
 * الحصول على الطابع الزمني للمزامنة
 * Get sync timestamp
 * 
 * @returns الطابع الزمني للمزامنة
 */
export const getSyncTimestamp = (): string | null => {
  return syncTimestamp;
};
