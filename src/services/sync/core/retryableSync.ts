
/**
 * وظائف المزامنة القابلة لإعادة المحاولة
 */

import { handleError } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';
import { getExponentialBackoff } from '@/utils/retryStrategy';
import { syncAllData } from './syncOperations';

/**
 * وظيفة مزامنة قابلة لإعادة المحاولة تلقائيًا
 * @param maxRetries أقصى عدد لمحاولات إعادة المزامنة
 * @param forceRefresh ما إذا كان يجب تجاهل التخزين المؤقت وإجبار التحديث
 */
export const retryableSync = async (
  maxRetries: number = 3,
  forceRefresh: boolean = false
): Promise<boolean> => {
  let retryCount = 0;
  let lastError: Error | null = null;

  const isNetworkError = (err: unknown): boolean => {
    if (err instanceof Error) {
      return (
        err.message.includes('network') ||
        err.message.includes('internet') ||
        err.message.includes('offline') ||
        err.message.includes('connection') ||
        err.message.toLowerCase().includes('timeout') ||
        err.message.toLowerCase().includes('failed to fetch')
      );
    }
    return false;
  };

  const isAuthError = (err: unknown): boolean => {
    if (err instanceof Error) {
      return (
        err.message.includes('authentication') ||
        err.message.includes('auth') ||
        err.message.includes('permission') ||
        err.message.includes('access') ||
        err.message.includes('token') ||
        err.message.includes('unauthorized') ||
        err.message.includes('forbidden')
      );
    }
    return false;
  };

  const isDataError = (err: unknown): boolean => {
    if (err instanceof Error) {
      return (
        err.message.includes('data') ||
        err.message.includes('database') ||
        err.message.includes('duplicate') ||
        err.message.includes('constraint') ||
        err.message.includes('schema')
      );
    }
    return false;
  };

  // تنفيذ محاولة المزامنة مع توقيت إعادة المحاولة التصاعدي
  while (retryCount <= maxRetries) {
    try {
      // إذا كانت هناك محاولة إعادة، عرض إشعار
      if (retryCount > 0) {
        toast({
          title: `محاولة إعادة المزامنة (${retryCount}/${maxRetries})`,
          description: "جاري محاولة المزامنة مرة أخرى بعد فشل المحاولة السابقة",
          duration: 3000,
        });
        
        // تأخير متزايد بين المحاولات
        const backoffTime = getExponentialBackoff(retryCount, 1000, 30000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }

      // محاولة المزامنة
      const result = await syncAllData(forceRefresh);
      
      // إذا نجحت المزامنة بعد محاولة إعادة، عرض إشعار
      if (retryCount > 0) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تجاوز الخطأ السابق وإكمال المزامنة بنجاح",
          duration: 3000,
        });
      }
      
      return result;
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error(String(error));
      lastError = syncError;
      retryCount++;
      
      // تصنيف نوع الخطأ لتحديد ما إذا كان يجب الاستمرار في المحاولة
      const shouldContinueRetrying = retryCount <= maxRetries && (
        isNetworkError(error) || 
        (isDataError(error) && retryCount <= 1) // إعادة محاولة أخطاء البيانات مرة واحدة فقط
      );
      
      // لا تعيد المحاولة لأخطاء المصادقة
      if (isAuthError(error)) {
        console.error('خطأ في المصادقة، لن تتم إعادة المحاولة:', syncError);
        toast({
          title: "خطأ في المصادقة",
          description: "فشلت المزامنة بسبب مشكلة في المصادقة. يرجى تسجيل الدخول مرة أخرى.",
          variant: "destructive",
          duration: 5000,
        });
        break;
      }
      
      if (!shouldContinueRetrying) {
        console.error(`توقفت إعادة المحاولة بعد ${retryCount} محاولات:`, syncError);
        break;
      }
      
      console.warn(`فشلت المزامنة (محاولة ${retryCount}/${maxRetries}):`, syncError.message);
    }
  }

  // إذا وصلنا إلى هنا، فقد فشلت جميع المحاولات
  if (lastError) {
    toast({
      title: "فشلت جميع محاولات المزامنة",
      description: `فشلت المزامنة بعد ${maxRetries} محاولات. آخر خطأ: ${lastError.message}`,
      variant: "destructive",
      duration: 5000,
    });
  }
  
  return false;
};

/**
 * وظيفة مزامنة مع إمكانية إعادة المحاولة يدويًا
 * @param forceRefresh ما إذا كان يجب تجاهل التخزين المؤقت وإجبار التحديث
 */
export const manualRetryableSync = async (forceRefresh: boolean = false): Promise<{
  success: boolean;
  error: Error | null;
  retry: () => Promise<boolean>;
}> => {
  try {
    const result = await syncAllData(forceRefresh);
    return {
      success: result,
      error: null,
      retry: async () => await manualRetryableSync(forceRefresh).then(r => r.success)
    };
  } catch (error) {
    const syncError = error instanceof Error ? error : new Error(String(error));
    console.error('خطأ في المزامنة اليدوية:', syncError);
    
    return {
      success: false,
      error: syncError,
      retry: async () => {
        try {
          const result = await syncAllData(forceRefresh);
          return result;
        } catch (retryError) {
          console.error('فشلت إعادة المحاولة اليدوية:', retryError);
          return false;
        }
      }
    };
  }
};

// إضافة وظيفة تنفيذ المزامنة القابلة لإعادة المحاولة 
export const executeRetryableSync = async (
  syncFn: () => Promise<boolean>,
  operationName: string = 'Sync Operation',
  timeout: number = 30000
): Promise<boolean> => {
  try {
    console.log(`تنفيذ عملية مزامنة: ${operationName} بمهلة ${timeout}ms`);
    
    // تنفيذ دالة المزامنة مع مهلة زمنية
    const result = await Promise.race([
      syncFn(),
      new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error(`تجاوزت العملية الوقت المسموح: ${operationName}`)), timeout)
      )
    ]);
    
    return result;
  } catch (error) {
    console.error(`فشل في تنفيذ المزامنة: ${operationName}`, error);
    handleError(error, `Sync operation: ${operationName}`);
    return false;
  }
};
