
/**
 * عمليات المزامنة المحسنة مع دعم إعادة المحاولة المتقدمة
 * Enhanced sync operations with advanced retry support
 */

import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';
import { handleError } from '@/utils/errorHandling';
import { setSyncActive } from '@/services/sync/status/syncState';
import { setSyncError, clearSyncError, logSyncError } from '@/services/sync/status/errorHandling';
import { setIsSyncing } from '@/services/dataStore';
import { toast } from '@/hooks/use-toast';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';
import { analyzeNetworkError } from '@/services/sync/remote/fetch/errorHandling';

/**
 * تنفيذ عملية مزامنة مع دعم إعادة المحاولة والتعامل مع الأخطاء
 * Execute a sync operation with retry support and error handling
 */
export async function executeRetryableSync<T>(
  syncOperation: () => Promise<T>,
  operationName: string,
  criticalOperation: boolean = false,
  timeout: number = 20000
): Promise<T | null> {
  setSyncActive(true);
  setIsSyncing(true);
  clearSyncError();
  
  // تحديد عدد المحاولات بناءً على ما إذا كان التطبيق يعمل على Vercel
  const maxRetries = isRunningOnVercel() ? 5 : 3;
  
  try {
    return await retry(
      syncOperation,
      {
        ...createProgressiveRetryStrategy(maxRetries, criticalOperation),
        maxDelay: timeout, // إضافة maxDelay بشكل صريح من معلمة timeout
        onRetry: (error, attempt, delay) => {
          console.log(`إعادة محاولة ${operationName} (${attempt}/${maxRetries}) بعد ${delay}ms / Retrying ${operationName} (${attempt}/${maxRetries}) after ${delay}ms`);
          
          if (attempt === 1) {
            toast({
              title: "جاري إعادة المحاولة / Retrying",
              description: `فشلت عملية ${operationName}، جاري إعادة المحاولة تلقائيًا... / ${operationName} failed, automatically retrying...`,
              duration: 3000,
            });
          }
        },
        onFinalFailure: (error, attempts) => {
          // تحليل الخطأ لمزيد من المعلومات
          const errorAnalysis = analyzeNetworkError(error);
          
          // تعيين خطأ المزامنة مع معلومات إضافية
          setSyncError(`فشلت عملية ${operationName} بعد ${attempts} محاولات: ${errorAnalysis.message}`, {
            retryable: errorAnalysis.retryable,
            attemptCount: attempts,
            code: errorAnalysis.code,
            details: {
              ...errorAnalysis.details,
              operationName,
              critical: errorAnalysis.critical,
              maxRetries
            }
          });
          
          // تحسين الرسالة المعروضة بناءً على نوع العملية
          let errorTitle = "فشلت المزامنة / Sync Failed";
          let errorMessage = `تعذر إكمال عملية ${operationName} بعد ${attempts} محاولات. سيتم استخدام البيانات المحلية.`;
          
          if (errorAnalysis.critical) {
            errorTitle = "خطأ حرج في المزامنة / Critical Sync Error";
            errorMessage = `حدث خطأ حرج أثناء ${operationName}. يرجى التحقق من اتصالك وإعادة تحميل التطبيق.`;
          } else if (isRunningOnVercel()) {
            errorMessage = `تعذر إكمال عملية ${operationName} بعد ${attempts} محاولات على Vercel. سيتم استخدام البيانات المحلية.`;
          }
            
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
            duration: errorAnalysis.critical ? 10000 : 5000,
          });
        }
      }
    );
  } catch (error) {
    // تم التعامل مع الخطأ النهائي في onFinalFailure
    // Final error was handled in onFinalFailure
    return null;
  } finally {
    setIsSyncing(false);
    setSyncActive(false);
  }
}

/**
 * تنفيذ استعلام مع إعادة المحاولة وتسجيل الخروج التلقائي
 * Execute a query with retry and automatic fallback
 */
export async function executeRetryableQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string,
  fallbackValue: T
): Promise<T> {
  // تحديد عدد المحاولات بناءً على ما إذا كان التطبيق يعمل على Vercel
  const maxRetries = isRunningOnVercel() ? 3 : 2;
  
  try {
    return await retry(
      queryFn,
      {
        ...createProgressiveRetryStrategy(maxRetries),
        onRetry: (error, attempt, delay) => {
          // تسجيل محاولة إعادة الاستعلام
          console.log(`محاولة استعلام ${queryName} (${attempt}/${maxRetries}) بعد ${delay}ms`);
        },
        onFinalFailure: (error) => {
          // تسجيل الخطأ بتفاصيل أكثر
          console.error(`فشل الاستعلام ${queryName}: / Query ${queryName} failed:`, error);
          
          // تحليل الخطأ
          const errorAnalysis = analyzeNetworkError(error);
          
          // تسجيل الخطأ في نظام إدارة الأخطاء
          logSyncError(error, `query:${queryName}`, false);
        }
      }
    );
  } catch (error) {
    console.warn(`استخدام القيمة الاحتياطية للاستعلام ${queryName} بعد الفشل / Using fallback value for query ${queryName} after failure`);
    
    // إظهار إشعار فقط للاستعلامات المهمة
    if (queryName.includes('channels') || queryName.includes('categories') || queryName.includes('countries')) {
      toast({
        title: "تعذر تحديث البيانات",
        description: `سيتم استخدام البيانات المخزنة محليًا لـ ${queryName}`,
        duration: 3000,
      });
    }
    
    return fallbackValue;
  }
}

/**
 * تنفيذ عملية مع مؤشر تقدم وإشعارات مناسبة
 * Execute an operation with progress indication and proper notifications
 */
export async function executeOperationWithProgress<T>(
  operation: () => Promise<T>,
  options: {
    operationName: string;
    loadingMessage: string;
    successMessage: string;
    errorMessage: string;
    maxRetries?: number;
    showToast?: boolean;
  }
): Promise<T | null> {
  const {
    operationName,
    loadingMessage,
    successMessage,
    errorMessage,
    maxRetries = 2,
    showToast = true
  } = options;
  
  // إظهار إشعار البدء
  let toastId;
  if (showToast) {
    toastId = toast({
      title: operationName,
      description: loadingMessage,
      duration: 3000,
    });
  }
  
  try {
    // تنفيذ العملية مع إعادة المحاولة
    const result = await retry(
      operation,
      createProgressiveRetryStrategy(maxRetries)
    );
    
    // إظهار إشعار النجاح
    if (showToast) {
      toast({
        title: operationName,
        description: successMessage,
        duration: 3000,
      });
    }
    
    return result;
  } catch (error) {
    // معالجة الخطأ
    handleError(error, operationName);
    
    // إظهار إشعار الخطأ
    if (showToast) {
      toast({
        title: `خطأ في ${operationName}`,
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
    
    return null;
  }
}
