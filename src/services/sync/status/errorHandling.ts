
/**
 * إدارة أخطاء المزامنة
 * Sync error management
 */

// آخر خطأ مزامنة
// Last sync error
let lastSyncError: { message: string; time: string } | null = null;

/**
 * تعيين خطأ المزامنة
 * Set sync error
 */
export const setSyncError = (error: { message: string; time: string }) => {
  lastSyncError = error;
  
  // تسجيل الخطأ في التخزين المحلي للتتبع
  try {
    localStorage.setItem('last_sync_error', JSON.stringify(error));
    localStorage.setItem('last_sync_success', 'false');
  } catch (e) {
    console.error('فشل في تخزين بيانات خطأ المزامنة محليًا:', e);
  }
};

/**
 * مسح خطأ المزامنة
 * Clear sync error
 */
export const clearSyncError = () => {
  lastSyncError = null;
  
  // مسح بيانات الخطأ من التخزين المحلي
  try {
    localStorage.removeItem('last_sync_error');
  } catch (e) {
    console.error('فشل في مسح بيانات خطأ المزامنة من التخزين المحلي:', e);
  }
};

/**
 * الحصول على آخر خطأ مزامنة
 * Get last sync error
 */
export const getLastSyncError = () => {
  return lastSyncError;
};
