
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';

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
      
      // وضع رسالة الخطأ
      setError(errorMsg);
      
      // محاولة التشغيل مرة أخرى فقط إذا كانت الأخطاء ليست متكررة بشكل كبير
      if (consecutiveErrors <= 3) {
        const shouldRetry = handlePlaybackError();
        if (!shouldRetry) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        console.error(`Too many consecutive errors (${consecutiveErrors}), stopping auto-retry`);
        
        try {
          const { toast } = require('@/hooks/use-toast');
          toast({
            title: "خطأ متكرر في تشغيل الفيديو",
            description: "حدثت عدة أخطاء متتالية، يرجى إعادة المحاولة يدوياً",
            variant: "destructive",
            duration: 5000,
          });
        } catch (e) {
          console.error("Error showing toast:", e);
        }
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
          if (isCurrentlyStalled && videoRef.current) {
            // تحقق مما إذا كان الفيديو لا يزال في حالة تعليق
            if (videoRef.current.readyState < 3) {
              try {
                const { toast } = require('@/hooks/use-toast');
                toast({
                  title: "بطء في التحميل",
                  description: "جاري محاولة استئناف البث...",
                  duration: 3000,
                });
              } catch (e) {
                console.error("Error showing toast:", e);
              }
            } else {
              // تم حل المشكلة قبل عرض الإشعار
              isCurrentlyStalled = false;
            }
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
    
    const handleProgress = () => {
      // إذا كان هناك تقدم في التحميل، فإن الفيديو يعمل بشكل صحيح
      if (isCurrentlyStalled && videoRef.current && videoRef.current.readyState >= 3) {
        console.log('Video recovered from stall');
        isCurrentlyStalled = false;
        setIsLoading(false);
      }
    };
    
    // إضافة المستمعين
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('suspend', handleSuspend);
    video.addEventListener('progress', handleProgress);
    
    // تنظيف المستمعين عند إلغاء التحميل
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplay', handleCanPlay);
        videoRef.current.removeEventListener('playing', handlePlaying);
        videoRef.current.removeEventListener('error', handleError);
        videoRef.current.removeEventListener('stalled', handleStalled);
        videoRef.current.removeEventListener('waiting', handleWaiting);
        videoRef.current.removeEventListener('ended', handleEnded);
        videoRef.current.removeEventListener('suspend', handleSuspend);
        videoRef.current.removeEventListener('progress', handleProgress);
      }
    };
  }, [videoRef, setIsPlaying, setIsLoading, setError, handlePlaybackError]);
}
