
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useEffect, useRef } from 'react';

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

  // إعداد منطق إعادة المحاولة - أبسط للأجهزة المحمولة
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
    if (currentChannelRef.current.id !== channel.id) {
      console.log("تغيير القناة من", currentChannelRef.current.name, "إلى", channel.name);
    }
    currentChannelRef.current = channel;
  }, [channel]);

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
      name: channel.name,
      streamUrl: channel.streamUrl ? "موجود" : "مفقود",
      isMobile,
      isPlaying,
      isLoading,
      error: error || "لا يوجد خطأ"
    });
  }, [channel, isMobile, isPlaying, isLoading, error]);

  return {
    videoRef,
    isPlaying,
    isLoading,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  };
}
