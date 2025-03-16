
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
import { useVideoLoadHandler } from './useVideoLoadHandler';
import { useVideoEventListeners } from './useVideoEventListeners';
import { toast } from '@/hooks/use-toast';

export function useVideoEvents({
  videoRef,
  channel,
  isPlaying,
  setIsPlaying,
  setIsLoading,
  setError,
  retryCount,
  handlePlaybackError
}: {
  videoRef: VideoRef;
  channel: Channel;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  retryCount: number;
  handlePlaybackError: () => boolean;
}) {
  const { initializeVideoPlayback } = useVideoLoadHandler();
  
  // تسجيل مستمعي أحداث الفيديو
  useVideoEventListeners({
    videoRef,
    setIsPlaying,
    setIsLoading,
    setError,
    handlePlaybackError
  });

  // تأثير محسّن لإعداد الفيديو مع حماية ضد الأخطاء
  useEffect(() => {
    console.log("إعداد الفيديو للقناة:", channel.name, "محاولة:", retryCount);
    
    if (!channel?.streamUrl) {
      setError('عنوان بث القناة غير متوفر، يرجى التحقق من مصادر البيانات');
      setIsLoading(false);
      return;
    }
    
    // إعادة تعيين الحالات
    setError(null);
    setIsLoading(true);
    
    // معرّف المؤقت
    let timeoutId: number | undefined;
    let loadTimeoutId: number | undefined;
    
    // إضافة مهلة زمنية للتحميل
    loadTimeoutId = window.setTimeout(() => {
      if (videoRef.current && videoRef.current.readyState === 0) {
        console.warn("تجاوز مهلة تحميل الفيديو - محاولة إعادة التحميل");
        if (handlePlaybackError()) {
          toast({
            title: "تأخر في التحميل",
            description: "يتم استخدام البيانات المحلية، جاري إعادة المحاولة...",
            duration: 3000,
          });
        }
      }
    }, 10000); // تقليل المهلة إلى 10 ثوانٍ
    
    // دالة الإعداد
    const setupVideo = () => {
      try {
        // تنظيف أي مصدر فيديو موجود
        if (videoRef.current) {
          try {
            videoRef.current.pause();
            if (videoRef.current.src !== channel.streamUrl) {
              videoRef.current.src = '';
              videoRef.current.load();
            }
          } catch (e) {
            console.error("خطأ في تنظيف الفيديو:", e);
          }
        }
        
        // تهيئة تشغيل الفيديو بعد تأخير قصير
        timeoutId = window.setTimeout(() => {
          if (videoRef.current) {
            console.log("تهيئة تشغيل الفيديو بعد التأخير");
            initializeVideoPlayback(videoRef, channel, setIsLoading, setError);
          }
        }, 200);
      } catch (error) {
        console.error("خطأ غير متوقع في إعداد الفيديو:", error);
        setError('حدث خطأ غير متوقع أثناء تحميل الفيديو، جاري استخدام البيانات المحلية');
        setIsLoading(false);
      }
    };
    
    // تنفيذ الإعداد
    setupVideo();
    
    // وظيفة التنظيف
    return () => {
      // تنظيف المؤقتات
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      
      if (loadTimeoutId !== undefined) {
        clearTimeout(loadTimeoutId);
      }
      
      if (videoRef.current) {
        console.log("تنظيف عنصر الفيديو");
        try {
          // إزالة المستمعين أولاً
          videoRef.current.oncanplay = null;
          videoRef.current.onplaying = null;
          videoRef.current.onerror = null;
          videoRef.current.onstalled = null;
          videoRef.current.onwaiting = null;
          videoRef.current.onended = null;
          
          // إيقاف وتنظيف الفيديو
          videoRef.current.pause();
          videoRef.current.src = '';
          videoRef.current.load();
        } catch (e) {
          console.error("خطأ أثناء تنظيف الفيديو:", e);
        }
      }
    };
  }, [channel, channel.streamUrl, retryCount]);
}
