
/**
 * مرفق لإدارة إعادة المحاولة التلقائية
 */
import { useCallback } from 'react';
import { VideoRef, setupVideoSource } from './useVideoSetup';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { cleanupVideoPlayer } from './utils/videoCleanup';
import { setupVideoAttributes } from './utils/videoAttributes';
import { calculateExponentialDelay } from './utils/retryStrategies';

interface UseAutoRetryParams {
  videoRef: VideoRef;
  channel: Channel;
  retryCount: number;
  maxRetries: number;
  setRetryCount: (cb: (prev: number) => number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * مرفق لإدارة عمليات إعادة المحاولة التلقائية
 */
export function useAutoRetry({
  videoRef,
  channel,
  retryCount,
  maxRetries,
  setRetryCount,
  setIsLoading,
  setError
}: UseAutoRetryParams) {
  const { toast } = useToast();
  
  // منطق إعادة المحاولة التلقائية
  const handlePlaybackError = useCallback(() => {
    if (retryCount < maxRetries) {
      console.log(`إعادة محاولة تلقائية (${retryCount + 1}/${maxRetries})...`);
      
      // حساب التأخير المناسب للمحاولة التالية
      const delayMs = calculateExponentialDelay(retryCount);
      
      const retry = () => {
        setRetryCount(prev => prev + 1);
        
        // استخدام وظيفة التنظيف المشتركة
        if (!cleanupVideoPlayer(videoRef)) {
          setError("فشل في إعادة تهيئة مشغل الفيديو");
          setIsLoading(false);
          return;
        }
        
        setTimeout(() => {
          if (!videoRef.current) return;
          
          try {
            // إعادة إعداد الفيديو
            setupVideoAttributes(videoRef.current, { attemptNumber: retryCount });
            
            const streamUrl = channel?.streamUrl;
            if (!streamUrl) {
              setError("عنوان البث غير متوفر");
              setIsLoading(false);
              return;
            }
            
            if (setupVideoSource(videoRef.current, streamUrl)) {
              // محاولة التشغيل
              videoRef.current.play().catch(e => {
                console.error("فشلت إعادة المحاولة التلقائية:", e);
                
                // معالجة خاصة لحالة NotAllowedError
                if (e.name === "NotAllowedError") {
                  setError('انقر للتشغيل، التشغيل التلقائي ممنوع');
                  setIsLoading(false);
                } else {
                  // محاولة إعادة المحاولة مرة أخرى
                  setError('حدث خطأ أثناء محاولة التشغيل');
                  setIsLoading(false);
                }
              });
            } else {
              console.error("فشل في إعداد مصدر الفيديو أثناء إعادة المحاولة التلقائية");
              setError("فشل في إعداد مصدر الفيديو");
              setIsLoading(false);
            }
          } catch (e) {
            console.error("خطأ في إعادة المحاولة التلقائية:", e);
            setError("حدث خطأ غير متوقع أثناء إعادة المحاولة");
            setIsLoading(false);
          }
        }, 500);
      };
      
      setTimeout(retry, delayMs);
      
      return true;
    } else {
      setError('تعذر تشغيل البث بعد عدة محاولات. انقر على إعادة المحاولة.');
      setIsLoading(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: "يرجى التحقق من اتصالك بالإنترنت وانقر على إعادة المحاولة",
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    }
  }, [retryCount, maxRetries, videoRef, channel, setIsLoading, setError, setRetryCount, toast]);

  return { handlePlaybackError };
}
