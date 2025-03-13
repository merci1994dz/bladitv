
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
    
    // معالجات الأحداث المبسطة
    const handleCanPlay = () => {
      console.log('يمكن تشغيل الفيديو');
      setIsLoading(false);
    };
    
    const handlePlaying = () => {
      console.log('الفيديو قيد التشغيل');
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e: Event) => {
      // الحصول على مزيد من المعلومات عن الخطأ إن أمكن
      let errorDetails = "خطأ غير معروف";
      if (video.error) {
        errorDetails = `رمز: ${video.error.code}, رسالة: ${video.error.message}`;
      }
      console.error('حدث خطأ في الفيديو:', errorDetails);
      
      // إذا كان الفيديو ما زال "فارغًا" (لم يتم تحميله)، فقد يكون خطأ في العثور على المصدر
      if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        setError('لا يمكن الوصول إلى مصدر البث');
      } else {
        handlePlaybackError();
      }
    };
    
    const handleStalled = () => {
      console.log('الفيديو متوقف مؤقتًا');
      setIsLoading(true);
    };
    
    const handleWaiting = () => {
      console.log('الفيديو في وضع الانتظار');
      setIsLoading(true);
    };
    
    const handleEnded = () => {
      console.log('انتهى الفيديو');
      setIsPlaying(false);
    };

    // إضافة المستمعين
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    
    // وظيفة التنظيف
    return () => {
      // إزالة المستمعين
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef, setIsPlaying, setIsLoading, setError, handlePlaybackError]);
}
