
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
  // إعداد مستمعي الأحداث لعنصر الفيديو
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // معالجات الأحداث البسيطة
    const handleCanPlay = () => {
      console.log('Video can be played');
      setIsLoading(false);
    };
    
    const handlePlaying = () => {
      console.log('Video is playing');
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = () => {
      console.error('Video error occurred', video.error?.message || 'Unknown error');
      // معالجة الخطأ مع منطق إعادة المحاولة
      const shouldRetry = handlePlaybackError();
      if (!shouldRetry) {
        setIsLoading(false);
      }
    };
    
    const handleStalled = () => {
      console.log('Video stalled');
      setIsLoading(true);
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

    // إضافة المستمعين بمحاولة / التقاط لقوة التنفيذ
    try {
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      video.addEventListener('stalled', handleStalled);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('suspend', handleSuspend);
    } catch (e) {
      console.error("خطأ في إضافة مستمعي الأحداث:", e);
    }
    
    // وظيفة التنظيف
    return () => {
      try {
        if (!video) return;
        
        // إزالة المستمعين
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
        video.removeEventListener('stalled', handleStalled);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('suspend', handleSuspend);
      } catch (e) {
        console.error("خطأ في إزالة مستمعي الأحداث:", e);
      }
    };
  }, [videoRef, setIsPlaying, setIsLoading, setError, handlePlaybackError]);
}
