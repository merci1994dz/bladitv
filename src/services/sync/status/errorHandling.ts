
/**
 * إدارة أخطاء المزامنة
 * Sync error handling
 */

// مفتاح تخزين خطأ المزامنة
// Sync error storage key
const SYNC_ERROR_KEY = 'sync_error';

// نوع بيانات خطأ المزامنة
// Sync error data type
export interface SyncError {
  message: string;
  timestamp: number;
  details?: Record<string, any>;
}

/**
 * تعيين خطأ المزامنة
 * Set sync error
 */
export const setSyncError = (error: string | Error, details?: Record<string, any>): void => {
  try {
    const errorMessage = error instanceof Error ? error.message : error;
    
    const syncError: SyncError = {
      message: errorMessage,
      timestamp: Date.now(),
      details
    };
    
    localStorage.setItem(SYNC_ERROR_KEY, JSON.stringify(syncError));
    
    // إطلاق حدث خطأ المزامنة
    // Dispatch sync error event
    const errorEvent = new CustomEvent('sync_error', { 
      detail: syncError 
    });
    
    window.dispatchEvent(errorEvent);
  } catch (storageError) {
    console.error('خطأ في تخزين خطأ المزامنة:', storageError);
  }
};

/**
 * الحصول على خطأ المزامنة
 * Get sync error
 */
export const getSyncError = (): SyncError | null => {
  try {
    const errorJson = localStorage.getItem(SYNC_ERROR_KEY);
    
    if (!errorJson) {
      return null;
    }
    
    return JSON.parse(errorJson) as SyncError;
  } catch (error) {
    console.error('خطأ في استرداد خطأ المزامنة:', error);
    return null;
  }
};

/**
 * تسجيل خطأ المزامنة في السجل
 * Log sync error
 */
export const logSyncError = (error: string | Error, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : error;
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.error(`${contextPrefix}خطأ في المزامنة:`, errorMessage);
  
  // تعيين الخطأ في التخزين
  // Set error in storage
  setSyncError(errorMessage, { context });
};

/**
 * مسح خطأ المزامنة
 * Clear sync error
 */
export const clearSyncError = (): void => {
  try {
    localStorage.removeItem(SYNC_ERROR_KEY);
    
    // إطلاق حدث مسح خطأ المزامنة
    // Dispatch clear sync error event
    const clearEvent = new CustomEvent('sync_error_cleared');
    window.dispatchEvent(clearEvent);
  } catch (error) {
    console.error('خطأ في مسح خطأ المزامنة:', error);
  }
};
