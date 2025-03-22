
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
  
  // تحسين منطق إعادة المحاولة التلقائية للتركيز على المصادر الخارجية
  const handlePlaybackError = useCallback(() => {
    if (retryCount < maxRetries) {
      console.log(`إعادة محاولة تلقائية (${retryCount + 1}/${maxRetries})...`);
      
      // تقليل فترات الانتظار للحصول على استجابة أسرع
      const delayMs = Math.min(calculateExponentialDelay(retryCount), 3000);
      
      const retry = () => {
        setRetryCount(prev => prev + 1);
        
        // استخدام وظيفة التنظيف المشتركة
        if (!cleanupVideoPlayer(videoRef)) {
          setError("فشل في إعادة تهيئة مشغل الفيديو");
          setIsLoading(false);
          return;
        }
        
        // تقليل التأخير قبل إعادة المحاولة
        setTimeout(() => {
          if (!videoRef.current) return;
          
          try {
            // إعادة إعداد الفيديو مع معلومات إضافية للتشخيص
            setupVideoAttributes(videoRef.current, { 
              attemptNumber: retryCount,
              timestamp: Date.now() 
            });
            
            const streamUrl = channel?.streamUrl;
            if (!streamUrl) {
              setError("عنوان البث غير متوفر");
              setIsLoading(false);
              return;
            }
            
            // تحسين معلمات منع التخزين المؤقت
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const cacheBuster = `${streamUrl.includes('?') ? '&' : '?'}_=${timestamp}&r=${randomId}`;
            const streamUrlWithCache = `${streamUrl}${cacheBuster}`;
            
            console.log(`محاولة اتصال جديدة برابط: ${streamUrlWithCache}`);
            
            if (setupVideoSource(videoRef.current, streamUrlWithCache)) {
              // تعيين مهلة زمنية قصيرة للإلغاء إذا لم يبدأ التشغيل
              const playPromise = videoRef.current.play();
              
              // استخدام Promise.race مع مهلة زمنية لتسريع اكتشاف الفشل
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("تجاوز مهلة محاولة التشغيل")), 8000);
              });
              
              Promise.race([playPromise, timeoutPromise])
                .catch(e => {
                  console.error("فشلت إعادة المحاولة التلقائية:", e);
                  
                  // معالجة خاصة لحالة NotAllowedError
                  if (e.name === "NotAllowedError") {
                    setError('انقر للتشغيل، التشغيل التلقائي ممنوع');
                    setIsLoading(false);
                  } else {
                    // إعادة المحاولة مرة أخرى إذا كان السبب متعلقًا بالشبكة
                    const isNetworkError = 
                      e.message.includes("network") || 
                      e.message.includes("timeout") ||
                      e.message.includes("fetch") ||
                      e.message.includes("تجاوز مهلة");
                    
                    if (isNetworkError && retryCount < maxRetries - 1) {
                      console.log("خطأ شبكة، إعادة المحاولة تلقائيًا...");
                      // استدعاء إعادة المحاولة مباشرة بدون انتظار
                      handlePlaybackError();
                    } else {
                      setError(`حدث خطأ أثناء التشغيل: ${e.message || 'خطأ غير معروف'}`);
                      setIsLoading(false);
                    }
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
        }, 300); // تقليل التأخير من 500 إلى 300 مللي ثانية
      };
      
      setTimeout(retry, delayMs);
      
      return true;
    } else {
      // تحسين رسالة الخطأ النهائية للمستخدم والتركيز على إعادة المحاولة اليدوية
      const errorMessage = 'تعذر تشغيل البث بعد عدة محاولات. يرجى التأكد من اتصالك بالإنترنت وإعادة المحاولة.';
      setError(errorMessage);
      setIsLoading(false);
      
      // إظهار إشعار مع زر إعادة المحاولة
      toast({
        title: "تعذر تشغيل القناة",
        description: "يرجى التحقق من اتصالك بالإنترنت والنقر على زر إعادة المحاولة",
        variant: "destructive",
        duration: 10000, // إبقاء الإشعار لمدة أطول
      });
      
      return false;
    }
  }, [retryCount, maxRetries, videoRef, channel, setIsLoading, setError, setRetryCount, toast]);

  return { handlePlaybackError };
}
