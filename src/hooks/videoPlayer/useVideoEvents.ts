
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
import { useVideoLoadHandler } from './useVideoLoadHandler';
import { useVideoEventListeners } from './useVideoEventListeners';

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

  // تأثير محسّن لإعداد الفيديو - تم تحسينه لتوافق أفضل ومنع فقدان مصادر البث
  useEffect(() => {
    console.log("إعداد الفيديو للقناة:", channel.name, "محاولة:", retryCount);
    
    // إعادة تعيين الحالات
    setError(null);
    setIsLoading(true);
    
    // معرّف المؤقت
    let timeoutId: number | undefined;
    
    // دالة الإعداد
    const setupVideo = () => {
      // تنظيف أي مصدر فيديو موجود
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          
          // لا نقوم بإزالة السمة src مباشرة لتجنب مشاكل في بعض المتصفحات
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
    };
    
    // تنفيذ الإعداد
    setupVideo();
    
    // وظيفة التنظيف
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
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
  }, [channel.streamUrl, retryCount]);
}
