
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

  // تأثير الإعداد - مبسط لتوافق أفضل
  useEffect(() => {
    console.log("Setting up video for channel:", channel.name, "attempt:", retryCount);
    
    // إعادة تعيين الحالات
    setError(null);
    setIsLoading(true);
    
    // تنظيف أي مصدر فيديو موجود
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      } catch (e) {
        console.error("Error clearing video:", e);
      }
    }
    
    // تهيئة تشغيل الفيديو بعد تأخير قصير للأجهزة المحمولة
    const timeoutId = setTimeout(() => {
      if (videoRef.current) {
        console.log("Initializing video playback after delay");
        initializeVideoPlayback(videoRef, channel, setIsLoading, setError);
      }
    }, 300);
    
    // وظيفة التنظيف
    return () => {
      clearTimeout(timeoutId);
      if (videoRef.current) {
        console.log("Cleaning up video element");
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
          videoRef.current.removeAttribute('src');
        } catch (e) {
          console.error("Error during video cleanup:", e);
        }
      }
    };
  }, [channel.streamUrl, retryCount]);
}
