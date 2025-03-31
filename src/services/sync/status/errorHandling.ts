
/**
 * إدارة أخطاء المزامنة
 * Sync error management
 */

// مفتاح التخزين للخطأ
// Storage key for error
const SYNC_ERROR_KEY = 'sync_error';

// Types for error management
export interface SyncError {
  message: string;
  time: string;
  code?: string;
  details?: {
    source?: string;
    type?: string;
    reason?: string;
    timestamp?: number;
  };
}

/**
 * تعيين خطأ المزامنة
 * Set sync error
 */
export const setSyncError = (errorMessage: string, errorCode?: string): void => {
  try {
    const error: SyncError = {
      message: errorMessage,
      time: new Date().toISOString(),
      code: errorCode,
      details: {
        timestamp: Date.now()
      }
    };
    
    localStorage.setItem(SYNC_ERROR_KEY, JSON.stringify(error));
  } catch (e) {
    console.error('خطأ في تخزين خطأ المزامنة:', e);
  }
};

/**
 * مسح خطأ المزامنة
 * Clear sync error
 */
export const clearSyncError = (): void => {
  try {
    localStorage.removeItem(SYNC_ERROR_KEY);
  } catch (e) {
    console.error('خطأ في مسح خطأ المزامنة:', e);
  }
};

/**
 * الحصول على خطأ المزامنة
 * Get sync error
 */
export const getSyncError = (): SyncError | null => {
  try {
    const errorJson = localStorage.getItem(SYNC_ERROR_KEY);
    if (!errorJson) return null;
    
    return JSON.parse(errorJson) as SyncError;
  } catch (e) {
    console.error('خطأ في قراءة خطأ المزامنة:', e);
    return null;
  }
};

/**
 * تسجيل خطأ المزامنة
 * Log sync error
 */
export const logSyncError = (error: Error | string, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error(`Sync Error ${context ? `(${context})` : ''}:`, errorMessage);
  setSyncError(errorMessage);
};
