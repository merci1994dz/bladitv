
/**
 * مرفق متخصص لجلب البيانات مع دعم إعادة المحاولة ومعالجة الأخطاء
 */

import { useQuery, useQueryClient, UseMutationResult, useMutation } from '@tanstack/react-query';
import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';
import { handleError } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';

/**
 * مرفق لجلب البيانات مع دعم إعادة المحاولة ومعالجة الأخطاء
 */
export function useReliableQuery<T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retryCount?: number;
    criticalData?: boolean;
    onSuccess?: (data: T) => void;
    fallbackData?: T;
  }
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 دقائق افتراضيًا
    cacheTime = 10 * 60 * 1000, // 10 دقائق افتراضيًا
    retryCount = 2,
    criticalData = false,
    onSuccess,
    fallbackData
  } = options || {};

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      try {
        return await retry(
          fetchFn,
          {
            maxRetries: criticalData ? retryCount + 1 : retryCount,
            initialDelay: 1000,
            backoffFactor: 1.5,
            maxDelay: 15000,
            retryOnNetworkError: true,
            retryOnServerError: true,
            onRetry: (error, attempt, delay) => {
              console.log(`إعادة محاولة جلب ${queryKey.join('/')} (${attempt}/${retryCount}) بعد ${delay}ms`, error);
            }
          }
        );
      } catch (error) {
        // تسجيل الخطأ ومعالجته
        handleError(error, `جلب ${queryKey.join('/')}`);
        
        // إذا كانت هناك بيانات احتياطية، استخدمها في حالة الفشل
        if (fallbackData !== undefined) {
          console.log(`استخدام بيانات احتياطية لـ ${queryKey.join('/')}`);
          return fallbackData;
        }
        
        // إعادة رمي الخطأ إذا لم تكن هناك بيانات احتياطية
        throw error;
      }
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: false, // نحن نتعامل مع إعادة المحاولة في دالة queryFn
    meta: {
      onSuccessCallback: onSuccess
    }
  });
}

/**
 * مرفق للطلبات المتغيرة مع دعم إعادة المحاولة ومعالجة الأخطاء
 */
export function useReliableMutation<TData, TVariables, TContext, TError = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void;
    retryCount?: number;
    showSuccessToast?: boolean;
    successMessage?: string;
  }
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    onSuccess,
    onError,
    onSettled,
    retryCount = 1,
    showSuccessToast = false,
    successMessage = 'تمت العملية بنجاح'
  } = options || {};
  
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      try {
        return await retry(
          () => mutationFn(variables),
          {
            maxRetries: retryCount,
            initialDelay: 1000,
            backoffFactor: 2,
            maxDelay: 10000,
            retryOnNetworkError: true,
            retryOnServerError: true,
            onRetry: (error, attempt, delay) => {
              console.log(`إعادة محاولة الطلب المتغير (${attempt}/${retryCount}) بعد ${delay}ms`, error);
            }
          }
        );
      } catch (error) {
        // تسجيل الخطأ ومعالجته
        handleError(error, 'عملية طلب متغير');
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast({
          title: "تم بنجاح",
          description: successMessage,
          duration: 3000,
        });
      }
      
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // الخطأ تم التعامل معه بالفعل في mutationFn
      if (onError) {
        onError(error as TError, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) {
        onSettled(data, error as TError | null, variables, context);
      }
    },
    retry: false, // نحن نتعامل مع إعادة المحاولة في دالة mutationFn
  });
}
