
/**
 * عمليات المزامنة المحسنة مع دعم إعادة المحاولة المتقدمة
 */

import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';
import { handleError } from '@/utils/errorHandling';
import { setSyncActive, setSyncError, clearSyncError } from '../status';
import { setIsSyncing } from '../../dataStore';
import { toast } from '@/hooks/use-toast';

/**
 * تنفيذ عملية مزامنة مع دعم إعادة المحاولة والتعامل مع الأخطاء
 */
export async function executeRetryableSync<T>(
  syncOperation: () => Promise<T>,
  operationName: string,
  criticalOperation: boolean = false
): Promise<T | null> {
  setSyncActive(true);
  setIsSyncing(true);
  clearSyncError();
  
  try {
    return await retry(
      syncOperation,
      {
        ...createProgressiveRetryStrategy(3, criticalOperation),
        onRetry: (error, attempt, delay) => {
          console.log(`إعادة محاولة ${operationName} (${attempt}/3) بعد ${delay}ms`);
          
          if (attempt === 1) {
            toast({
              title: "جاري إعادة المحاولة",
              description: `فشلت عملية ${operationName}، جاري إعادة المحاولة تلقائيًا...`,
              duration: 3000,
            });
          }
        },
        onFinalFailure: (error, attempts) => {
          const appError = handleError(error, operationName);
          setSyncError(`فشلت عملية ${operationName} بعد ${attempts} محاولات: ${appError.message}`);
          
          toast({
            title: "فشلت المزامنة",
            description: `تعذر إكمال عملية ${operationName} بعد عدة محاولات. سيتم استخدام البيانات المحلية.`,
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    );
  } catch (error) {
    // تم التعامل مع الخطأ النهائي في onFinalFailure
    return null;
  } finally {
    setIsSyncing(false);
    setSyncActive(false);
  }
}

/**
 * تنفيذ استعلام مع إعادة المحاولة وتسجيل الخروج التلقائي
 */
export async function executeRetryableQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string,
  fallbackValue: T
): Promise<T> {
  try {
    return await retry(
      queryFn,
      {
        ...createProgressiveRetryStrategy(2),
        onFinalFailure: (error) => {
          console.error(`فشل الاستعلام ${queryName}:`, error);
        }
      }
    );
  } catch (error) {
    console.warn(`استخدام القيمة الاحتياطية للاستعلام ${queryName} بعد الفشل`);
    return fallbackValue;
  }
}
