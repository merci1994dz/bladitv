
/**
 * معالجة أخطاء المزامنة
 * Sync error handling
 */

// Import directly from the connectivity index file to avoid circular dependency
import { checkConnectivityIssues } from './connectivity';
import { toast } from '@/hooks/use-toast';

// Define sync error types
type SyncError = {
  message: string;
  code?: string;
  type?: 'network' | 'server' | 'client' | 'timeout' | 'unknown';
  details?: any;
  time?: string;
};

// حالة الخطأ الحالية
let currentSyncError: SyncError | null = null;

/**
 * تعيين خطأ المزامنة
 * Set sync error
 */
export const setSyncError = (errorMessage: string): void => {
  currentSyncError = { 
    message: errorMessage,
    time: new Date().toISOString()
  };
  
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
 * تسجيل خطأ المزامنة
 * Log sync error
 */
export const logSyncError = (errorMessage: string, context?: string): void => {
  console.error(`خطأ في المزامنة (${context || 'unknown'}):`, errorMessage);
  setSyncError(errorMessage);
};

/**
 * التحقق من مشاكل الاتصال المتعلقة بالأخطاء
 * Check for connection issues based on errors
 */
export const checkConnectionFromError = async (error: unknown): Promise<boolean> => {
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
  
  // إذا تم اكتشاف مشكلة في الاتصال، تحقق فعلياً من حالة الاتصال
  if (isNetworkError) {
    console.warn('تم اكتشاف مشكلة في الاتصال:', errorMessage);
    
    // التحقق من الاتصال فعلياً
    const connectivityStatus = await checkConnectivityIssues();
    
    // تحديث حالة الخطأ بناءً على نتيجة فحص الاتصال
    if (!connectivityStatus.hasInternet || !connectivityStatus.hasServerAccess) {
      // تعيين نوع الخطأ
      currentSyncError = {
        message: !connectivityStatus.hasInternet 
          ? 'أنت غير متصل بالإنترنت' 
          : 'تعذر الاتصال بخادم المزامنة',
        type: 'network',
        details: errorMessage,
        time: new Date().toISOString()
      };
      
      // عرض إشعار للمستخدم
      if (typeof window !== 'undefined') {
        try {
          toast({
            title: "مشكلة في الاتصال",
            description: currentSyncError.message,
            variant: "destructive"
          });
        } catch (e) {
          // تجاهل أخطاء النافذة
          console.warn('تعذر عرض إشعار خطأ الاتصال:', e);
        }
      }
      
      return true;
    }
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
    currentSyncError = {
      ...error,
      time: error.time || new Date().toISOString()
    };
  }
};
