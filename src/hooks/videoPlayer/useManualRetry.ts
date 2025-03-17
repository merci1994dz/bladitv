
/**
 * مرفق لإدارة إعادة المحاولة اليدوية
 */
import { useCallback } from 'react';
import { VideoRef, setupVideoSource } from './useVideoSetup';
import { Channel } from '@/types';
import { toast } from "@/hooks/use-toast";
import { cleanupVideoPlayer, setupVideoAttributes } from './utils/videoCleanup';
import { canRetryNow, getDelayUntilNextRetry } from './utils/retryStrategies';
import { 
  attemptVideoPlay, 
  showRetrySuccessToast 
} from './utils/videoErrorHandling';

interface UseManualRetryParams {
  videoRef: VideoRef;
  channel: Channel;
  retryCount: number;
  lastRetryTime: number;
  setRetryCount: (cb: (prev: number) => number) => void;
  setLastRetryTime: (time: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
}

/**
 * مرفق لإدارة عمليات إعادة المحاولة اليدوية
 */
export function useManualRetry({
  videoRef,
  channel,
  retryCount,
  lastRetryTime,
  setRetryCount,
  setLastRetryTime,
  setIsLoading,
  setError,
  setIsPlaying
}: UseManualRetryParams) {
  // حد أدنى للفاصل الزمني بين محاولات إعادة المحاولة
  const minRetryInterval = 3000;
  
  // وظيفة إعادة المحاولة
  const retryPlayback = useCallback(async () => {
    // التحقق من فترة كافية بين المحاولات
    if (!canRetryNow(lastRetryTime, minRetryInterval)) {
      console.log("تم طلب إعادة المحاولة بسرعة كبيرة، تأجيل...");
      
      // تعيين مؤقت لإعادة المحاولة بعد الفاصل الزمني المناسب
      const delayUntilNextRetry = getDelayUntilNextRetry(lastRetryTime, minRetryInterval);
      setTimeout(() => {
        retryPlayback();
      }, delayUntilNextRetry);
      
      return;
    }
    
    console.log("بدء إعادة المحاولة اليدوية");
    const now = Date.now();
    setLastRetryTime(now);
    setError(null);
    setIsLoading(true);
    setRetryCount(prevCount => prevCount + 1);
    
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل البث...",
      duration: 3000,
    });
    
    // تنظيف المشغل أولاً
    if (cleanupVideoPlayer(videoRef)) {
      // إضافة تأخير قبل إعادة المحاولة للمساعدة في حل مشاكل التخزين المؤقت
      setTimeout(() => {
        if (!videoRef.current) return;
        
        try {
          // إعداد خصائص الفيديو
          setupVideoAttributes(videoRef.current);
          
          if (setupVideoSource(videoRef.current, channel.streamUrl)) {
            console.log("تم تهيئة مصدر الفيديو بنجاح، جاري محاولة التشغيل");
            
            // محاولة التشغيل مع معالجة الأخطاء
            attemptVideoPlay(videoRef, setIsPlaying, setIsLoading, setError)
              .then(success => {
                if (success) {
                  console.log("نجحت إعادة المحاولة اليدوية");
                  showRetrySuccessToast();
                }
              });
          } else {
            setError("فشل في إعداد مصدر الفيديو");
            setIsLoading(false);
          }
        } catch (error) {
          console.error('خطأ أثناء إعادة المحاولة اليدوية:', error);
          setError('حدث خطأ غير متوقع');
          setIsLoading(false);
        }
      }, 600);
    } else {
      // إذا فشل التنظيف، سجل الخطأ وأعلم المستخدم
      setError('فشل في إعادة تحميل مشغل الفيديو، حاول تحديث الصفحة');
      setIsLoading(false);
    }
  }, [videoRef, channel.streamUrl, lastRetryTime, minRetryInterval, setIsLoading, setError, setIsPlaying, setRetryCount, setLastRetryTime]);

  return { retryPlayback };
}
