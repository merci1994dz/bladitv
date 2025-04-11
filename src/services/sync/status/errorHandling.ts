
/**
 * معالجة أخطاء المزامنة
 * Sync error handling
 */

import { toast } from '@/hooks/use-toast';

// Define sync error types
type SyncError = {
  message: string;
  code?: string;
  type?: 'network' | 'server' | 'client' | 'timeout' | 'unknown';
  details?: any;
};

// حالة الخطأ الحالية
let currentSyncError: SyncError | null = null;

/**
 * تعيين خطأ المزامنة
 * Set sync error
 */
export const setSyncError = (errorMessage: string): void => {
  currentSyncError = { message: errorMessage };
  
  try {
    localStorage.setItem('last_sync_error', JSON.stringify(currentSyncError));
    localStorage.setItem('last_sync_error_time', new Date().toISOString());
  } catch (e) {
    console.error('تعذر تخزين معلومات الخطأ محليًا:', e);
  }
};

/**
 * مسح خطأ المزامنة
 * Clear sync error
 */
export const clearSyncError = (): void => {
  currentSyncError = null;
  
  try {
    localStorage.removeItem('last_sync_error');
  } catch (e) {
    console.error('تعذر مسح معلومات الخطأ محليًا:', e);
  }
};

/**
 * الحصول على خطأ المزامنة الحالي
 * Get current sync error
 */
export const getSyncError = (): SyncError | null => {
  return currentSyncError;
};

/**
 * التحقق من مشاكل الاتصال
 * Check for connectivity issues
 */
export const checkConnectivityIssues = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  // المؤشرات على مشاكل الاتصال
  const isNetworkError = (
    errorMessage.includes('network') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('internet') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('cors')
  );
  
  // إذا تم اكتشاف مشكلة في الاتصال
  if (isNetworkError) {
    console.warn('تم اكتشاف مشكلة في الاتصال:', errorMessage);
    
    // تعيين نوع الخطأ
    currentSyncError = {
      message: 'تعذر الاتصال بخادم المزامنة',
      type: 'network',
      details: errorMessage
    };
    
    // عرض إشعار للمستخدم
    if (typeof window !== 'undefined') {
      try {
        toast({
          title: "مشكلة في الاتصال",
          description: "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى",
          variant: "destructive"
        });
      } catch (e) {
        // تجاهل أخطاء النافذة
      }
    }
    
    return true;
  }
  
  return false;
};

/**
 * عرض خطأ المزامنة للمستخدم
 * Display sync error to user
 */
export const displaySyncError = (error: SyncError | string): void => {
  const errorObj = typeof error === 'string' ? { message: error } : error;
  
  toast({
    title: "خطأ في المزامنة",
    description: errorObj.message,
    variant: "destructive",
    duration: 5000
  });
  
  // تعيين الخطأ الحالي
  if (typeof error === 'string') {
    setSyncError(error);
  } else {
    currentSyncError = error;
  }
};
