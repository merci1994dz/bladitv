
/**
 * عمليات المزامنة المحسنة مع دعم إعادة المحاولة المتقدمة
 * Enhanced sync operations with advanced retry support
 */

import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';
import { handleError } from '@/utils/errorHandling';
import { setSyncActive } from '@/services/sync/status/syncState';
import { setSyncError, clearSyncError } from '@/services/sync/status/errorHandling';
import { setIsSyncing } from '@/services/dataStore';
import { toast } from '@/hooks/use-toast';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

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
          const appError = handleError(error, operationName);
          setSyncError(`فشلت عملية ${operationName} بعد ${attempts} محاولات: ${appError.message} / ${operationName} failed after ${attempts} attempts: ${appError.message}`);
          
          // رسالة خطأ أكثر تفصيلاً على Vercel
          const errorMessage = isRunningOnVercel() 
            ? `تعذر إكمال عملية ${operationName} بعد ${attempts} محاولات على Vercel. سيتم استخدام البيانات المحلية.` 
            : `تعذر إكمال عملية ${operationName} بعد عدة محاولات. سيتم استخدام البيانات المحلية.`;
            
          toast({
            title: "فشلت المزامنة / Sync Failed",
            description: errorMessage,
            variant: "destructive",
            duration: 5000,
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
        onFinalFailure: (error) => {
          console.error(`فشل الاستعلام ${queryName}: / Query ${queryName} failed:`, error);
        }
      }
    );
  } catch (error) {
    console.warn(`استخدام القيمة الاحتياطية للاستعلام ${queryName} بعد الفشل / Using fallback value for query ${queryName} after failure`);
    return fallbackValue;
  }
}
