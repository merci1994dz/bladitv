
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';
import { toast } from '@/hooks/use-toast';

export function useVideoEventListeners({
  videoRef,
  setIsPlaying,
  setIsLoading,
  setError,
  handlePlaybackError
}: {
  videoRef: VideoRef;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handlePlaybackError: () => boolean;
}) {
  // إعداد مستمعي الأحداث لعنصر الفيديو مع معالجة أفضل للأخطاء
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // تسجيل حالة التحميل لتجنب الإشعارات المتكررة
    let isCurrentlyStalled = false;
    let consecutiveErrors = 0;
    let lastErrorTime = 0;
    
    // معالجات الأحداث البسيطة مع تحسينات
    const handleCanPlay = () => {
      console.log('Video can be played');
      setIsLoading(false);
      // إعادة تعيين مؤشرات الخطأ عند نجاح التحميل
      isCurrentlyStalled = false;
      consecutiveErrors = 0;
    };
    
    const handlePlaying = () => {
      console.log('Video is playing');
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      // إعادة تعيين مؤشرات الخطأ عند بدء التشغيل
      isCurrentlyStalled = false;
      consecutiveErrors = 0;
    };
    
    const handleError = () => {
      // التحقق من تكرار الأخطاء خلال فترة زمنية قصيرة
      const now = Date.now();
      if (now - lastErrorTime < 2000) {
        consecutiveErrors++;
      } else {
        consecutiveErrors = 1;
      }
      lastErrorTime = now;
      
      // تسجيل التفاصيل الكاملة للخطأ
      const errorCode = video.error?.code || 0;
      const errorMessage = video.error?.message || 'Unknown error';
      console.error(`Video error occurred: Code ${errorCode}, Message: ${errorMessage}`);
      
      // معالجة مناسبة حسب نوع الخطأ
      let errorMsg = "حدث خطأ أثناء تشغيل الفيديو";
      
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          errorMsg = "تم إلغاء تحميل الوسائط";
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMsg = "حدث خطأ في الشبكة أثناء التحميل";
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMsg = "فشل في فك ترميز الوسائط";
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMsg = "تنسيق الوسائط غير مدعوم";
          break;
      }
      
      // عرض الخطأ فقط إذا كان متكرراً بشكل كبير
      if (consecutiveErrors > 3) {
        toast({
          title: "خطأ في تشغيل الفيديو",
          description: errorMsg,
          variant: "destructive",
          duration: 3000,
        });
      }
      
      // معالجة الخطأ مع منطق إعادة المحاولة
      const shouldRetry = handlePlaybackError();
      if (!shouldRetry) {
        setIsLoading(false);
      }
    };
    
    const handleStalled = () => {
      console.log('Video stalled');
      
      // تجنب عرض رسائل متكررة للحالة نفسها
      if (!isCurrentlyStalled) {
        isCurrentlyStalled = true;
        setIsLoading(true);
        
        // عرض إشعار فقط بعد فترة
        setTimeout(() => {
          if (isCurrentlyStalled) {
            toast({
              title: "بطء في التحميل",
              description: "جاري محاولة استئناف البث...",
              duration: 3000,
            });
          }
        }, 5000);
      }
    };
    
    const handleWaiting = () => {
      console.log('Video waiting');
      setIsLoading(true);
    };
    
    const handleEnded = () => {
      console.log('Video ended');
      setIsPlaying(false);
    };
    
    const handleSuspend = () => {
      console.log('Video download suspended (possibly paused)');
      // عادة ما يظهر هذا الحدث عندما يتوقف التحميل مؤقتًا
    };
    
    // معالج جديد للتقدم - يساعد في اكتشاف استئناف التشغيل بعد التوقف
    const handleProgress = () => {
      if (isCurrentlyStalled && video.readyState >= 3) {
        console.log('Video recovered from stall');
        isCurrentlyStalled = false;
        setIsLoading(false);
      }
    };
    
    // معالج جديد للوقت - يساعد في تتبع تقدم التشغيل
    const handleTimeUpdate = () => {
      // إذا تم تحديث الوقت، فهذا يعني أن الفيديو يعمل جيدًا
      if (isCurrentlyStalled) {
        console.log('Video playback resumed');
        isCurrentlyStalled = false;
        setIsLoading(false);
      }
    };

    // إضافة المستمعين بمحاولة / التقاط لقوة التنفيذ
    try {
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      video.addEventListener('stalled', handleStalled);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('suspend', handleSuspend);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('timeupdate', handleTimeUpdate);
    } catch (e) {
      console.error("خطأ في إضافة مستمعي الأحداث:", e);
    }
    
    // وظيفة التنظيف
    return () => {
      try {
        if (video) {
          // إزالة المستمعين
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('playing', handlePlaying);
          video.removeEventListener('error', handleError);
          video.removeEventListener('stalled', handleStalled);
          video.removeEventListener('waiting', handleWaiting);
          video.removeEventListener('ended', handleEnded);
          video.removeEventListener('suspend', handleSuspend);
          video.removeEventListener('progress', handleProgress);
          video.removeEventListener('timeupdate', handleTimeUpdate);
        }
      } catch (e) {
        console.error("خطأ في إزالة مستمعي الأحداث:", e);
      }
    };
  }, [videoRef, setIsPlaying, setIsLoading, setError, handlePlaybackError]);
}
