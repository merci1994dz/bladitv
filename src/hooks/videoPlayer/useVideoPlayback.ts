
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useEffect, useRef, useState } from 'react';

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  // إعداد حالة الفيديو الأساسية والمراجع
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMobile
  } = useVideoSetup();

  // إنشاء مرجع لتتبع القناة الحالية
  const currentChannelRef = useRef(channel);
  
  // إضافة حالة لتتبع اكتمال التحميل
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // إعداد عناصر التحكم في تشغيل الفيديو
  const {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo
  } = useVideoControl({
    videoRef,
    setIsLoading,
    setError
  });

  // إعداد منطق إعادة المحاولة - محسّن
  const {
    retryCount,
    retryPlayback,
    handlePlaybackError
  } = useVideoRetry({
    videoRef,
    channel,
    setIsLoading,
    setError,
    setIsPlaying
  });

  // تحديث مرجع القناة الحالية عند تغيير القناة
  useEffect(() => {
    // تسجيل معلومات القناة الجديدة
    if (currentChannelRef.current?.id !== channel?.id) {
      console.log("تغيير القناة من", currentChannelRef.current?.name || 'لا يوجد', "إلى", channel?.name || 'لا يوجد');
      
      // إعادة ضبط حالة الفيديو
      setIsLoading(true);
      setError(null);
      setIsVideoReady(false);
      
      // إعادة تحميل الفيديو
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
    
    currentChannelRef.current = channel;
  }, [channel, setIsLoading, setError]);

  // إضافة معالج لحدث canplay
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleCanPlay = () => {
      setIsVideoReady(true);
      setIsLoading(false);
      
      // محاولة التشغيل التلقائي
      if (videoElement) {
        videoElement.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            // قد يكون التشغيل التلقائي ممنوعًا على بعض المتصفحات
            console.log("خطأ في التشغيل التلقائي:", err);
          });
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('canplay', handleCanPlay);
      
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [videoRef, setIsLoading, setIsPlaying]);

  // إعداد مستمعي أحداث الفيديو
  useVideoEvents({
    videoRef,
    channel,
    isPlaying,
    setIsPlaying,
    setIsLoading,
    setError,
    retryCount,
    handlePlaybackError
  });
  
  // تسجيل معلومات تصحيح الأخطاء البسيطة
  useEffect(() => {
    console.log("معلومات القناة:", {
      name: channel?.name || 'لا يوجد',
      streamUrl: channel?.streamUrl ? "موجود" : "مفقود",
      isMobile,
      isPlaying,
      isLoading,
      isVideoReady,
      error: error || "لا يوجد خطأ"
    });
  }, [channel, isMobile, isPlaying, isLoading, isVideoReady, error]);

  return {
    videoRef,
    isPlaying,
    isLoading,
    isVideoReady,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  };
}
