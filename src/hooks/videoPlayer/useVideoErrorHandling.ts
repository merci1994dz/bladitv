
/**
 * مرفق متخصص للتعامل مع أخطاء الفيديو
 */

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';
import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';

export interface VideoErrorState {
  hasError: boolean;
  errorMessage: string | null;
  errorCode?: string | number;
  isRecoverable: boolean;
  attempts: number;
}

export interface VideoErrorHandlers {
  handlePlaybackError: (error: unknown) => Promise<boolean>;
  clearError: () => void;
  setCustomError: (message: string, isRecoverable?: boolean) => void;
  retryAfterError: () => Promise<boolean>;
  errorState: VideoErrorState;
}

export function useVideoErrorHandling(
  onRetry?: () => Promise<void>,
  maxRetries: number = 3
): VideoErrorHandlers {
  const [errorState, setErrorState] = useState<VideoErrorState>({
    hasError: false,
    errorMessage: null,
    isRecoverable: true,
    attempts: 0
  });

  // دالة لمسح حالة الخطأ
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorMessage: null,
      isRecoverable: true,
      attempts: 0
    });
  }, []);

  // دالة لتعيين خطأ مخصص
  const setCustomError = useCallback((message: string, isRecoverable: boolean = true) => {
    setErrorState(prev => ({
      hasError: true,
      errorMessage: message,
      isRecoverable,
      attempts: prev.attempts
    }));
  }, []);

  // دالة متطورة للتعامل مع أخطاء التشغيل
  const handlePlaybackError = useCallback(async (error: unknown): Promise<boolean> => {
    // تصنيف الخطأ
    let errorMessage = 'خطأ غير معروف في تشغيل الفيديو';
    let isRecoverable = true;
    let errorCode: string | number | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // تحليل نوع الخطأ لتحديد قابلية الاسترداد
      if (error.name === 'NotSupportedError' || error.name === 'SecurityError') {
        isRecoverable = false;
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'لم يسمح المتصفح بتشغيل الفيديو تلقائيًا. انقر للتشغيل.';
        isRecoverable = true;
      } else if (error.name === 'AbortError') {
        errorMessage = 'تم إلغاء تشغيل الفيديو.';
        isRecoverable = true;
      } else if (error.name === 'NetworkError' || error.message.includes('network')) {
        errorMessage = 'خطأ في الشبكة. تأكد من اتصالك بالإنترنت.';
        isRecoverable = true;
      }
    } else if ((error as any)?.code) {
      errorCode = (error as any).code;
      // أكواد أخطاء HTML5 للفيديو
      switch (errorCode) {
        case 1:
          errorMessage = 'تم إلغاء العملية. حاول مرة أخرى.';
          isRecoverable = true;
          break;
        case 2:
          errorMessage = 'حدث خطأ في الشبكة. تحقق من اتصالك بالإنترنت.';
          isRecoverable = true;
          break;
        case 3:
          errorMessage = 'حدث خطأ أثناء فك ترميز الفيديو.';
          isRecoverable = false;
          break;
        case 4:
          errorMessage = 'تنسيق الفيديو غير مدعوم.';
          isRecoverable = false;
          break;
        default:
          errorMessage = `خطأ في تشغيل الفيديو (${errorCode}).`;
          isRecoverable = true;
      }
    }
    
    // تسجيل الخطأ
    console.error('خطأ في تشغيل الفيديو:', error, {
      message: errorMessage,
      recoverable: isRecoverable,
      code: errorCode
    });
    
    // تحديث حالة الخطأ
    setErrorState(prev => ({
      hasError: true,
      errorMessage,
      errorCode,
      isRecoverable,
      attempts: prev.attempts + 1
    }));
    
    // إذا كان الخطأ قابل للاسترداد وعدد المحاولات أقل من الحد الأقصى، حاول مرة أخرى تلقائيًا
    if (isRecoverable && errorState.attempts < maxRetries && onRetry) {
      try {
        // محاولة استرداد تلقائية بعد تأخير
        const delay = Math.min(1000 * Math.pow(2, errorState.attempts), 8000);
        
        console.log(`محاولة استرداد تلقائية بعد ${delay}ms (المحاولة ${errorState.attempts + 1}/${maxRetries})`);
        
        setTimeout(async () => {
          await onRetry();
        }, delay);
        
        return true;
      } catch (retryError) {
        console.error('فشلت محاولة الاسترداد التلقائية:', retryError);
      }
    }
    
    return false;
  }, [errorState.attempts, maxRetries, onRetry]);

  // دالة لإعادة المحاولة بعد الخطأ
  const retryAfterError = useCallback(async (): Promise<boolean> => {
    if (!errorState.isRecoverable || !onRetry) {
      return false;
    }
    
    // عرض إشعار للمستخدم
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل الفيديو...",
      duration: 3000,
    });
    
    try {
      // استخدام آلية إعادة المحاولة المتطورة
      await retry(
        onRetry,
        createProgressiveRetryStrategy(2)
      );
      
      // مسح الخطأ بعد النجاح
      clearError();
      return true;
    } catch (error) {
      // تحديث رسالة الخطأ
      handleError(error, 'إعادة تشغيل الفيديو');
      setCustomError(
        'فشلت محاولات إعادة التشغيل. يرجى التحقق من اتصالك بالإنترنت وحاول مرة أخرى.',
        true
      );
      return false;
    }
  }, [clearError, errorState.isRecoverable, onRetry, setCustomError]);

  return {
    errorState,
    handlePlaybackError,
    clearError,
    setCustomError,
    retryAfterError
  };
}
