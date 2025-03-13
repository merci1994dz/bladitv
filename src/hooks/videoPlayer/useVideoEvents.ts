
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

  // تأثير الإعداد - مبسط للتوافق الأفضل مع الأجهزة المحمولة
  useEffect(() => {
    console.log("إعداد الفيديو للقناة:", channel.name, "محاولة:", retryCount);
    
    // إعادة تعيين الحالات
    setError(null);
    setIsLoading(true);
    
    // تهيئة تشغيل الفيديو مع تأخير أطول للسماح بالتنظيف
    const timeoutId = setTimeout(() => {
      if (videoRef.current) {
        console.log("تهيئة تشغيل الفيديو بعد التأخير");
        
        // تنظيف أي أحداث سابقة
        videoRef.current.oncanplay = null;
        videoRef.current.onplaying = null;
        videoRef.current.onerror = null;
        videoRef.current.onstalled = null;
        videoRef.current.onwaiting = null;
        videoRef.current.onended = null;
        
        initializeVideoPlayback(videoRef, channel, setIsLoading, setError);
      }
    }, 300);
    
    // دالة التنظيف
    return () => {
      clearTimeout(timeoutId);
      if (videoRef.current) {
        console.log("تنظيف عنصر الفيديو");
        try {
          // إزالة مستمعي الأحداث أولاً
          videoRef.current.oncanplay = null;
          videoRef.current.onplaying = null;
          videoRef.current.onerror = null;
          videoRef.current.onstalled = null;
          videoRef.current.onwaiting = null;
          videoRef.current.onended = null;
          
          // إيقاف وتنظيف الفيديو
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch (e) {
          console.error("خطأ أثناء تنظيف الفيديو:", e);
        }
      }
    };
  }, [channel.streamUrl, retryCount]);
}
