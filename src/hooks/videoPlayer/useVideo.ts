
import { useState, useRef, useEffect } from 'react';
import { Channel } from '@/types';
import { useVideoVolume } from './useVideoVolume';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoSetup } from './useVideoSetup';
import { useVideoEvents } from './useVideoEvents';
import { VIDEO_PLAYER } from '@/services/config';

interface UseVideoProps {
  channel: Channel;
  initialStreamUrl?: string;
}

export function useVideo({ channel, initialStreamUrl }: UseVideoProps) {
  // إعداد المراجع وحالة الفيديو
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    showControls,
    setShowControls,
    handleMouseMove
  } = useVideoSetup();

  // إعداد حالة التشغيل
  const {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo,
    toggleFullscreen
  } = useVideoControl({
    videoRef,
    setIsLoading,
    setError
  });

  // إعداد عناصر التحكم في الصوت
  const {
    isMuted,
    currentVolume,
    toggleMute,
    handleVolumeChange,
    initializeVolume
  } = useVideoVolume();

  // إعداد آلية إعادة المحاولة
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

  // إعداد مصدر البث الحالي
  const [currentStreamUrl, setCurrentStreamUrl] = useState(initialStreamUrl || channel.streamUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // معالج تغيير حالة ملء الشاشة
  const handleFullscreenChange = () => {
    setIsFullscreen(document.fullscreenElement !== null);
  };

  // تهيئة مشغل الفيديو عند تغيير القناة
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = currentStreamUrl;
      videoRef.current.load();
      initializeVolume(videoRef);
      setIsLoading(true);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentStreamUrl]);

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

  // القناة المحمية (لإخفاء عنوان URL)
  const secureChannel = {
    ...channel,
    streamUrl: currentStreamUrl,
    _displayUrl: VIDEO_PLAYER.HIDE_STREAM_URLS ? '[محمي]' : currentStreamUrl
  };

  // معالج تغيير مصدر البث
  const handleChangeStreamSource = (url: string) => {
    setCurrentStreamUrl(url);
    retryPlayback();
  };

  return {
    videoRef,
    secureChannel,
    isPlaying,
    isLoading,
    isMuted,
    isFullscreen,
    currentVolume,
    showControls,
    error,
    retryCount,
    currentStreamUrl,
    handleMouseMove,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    retryPlayback,
    seekVideo,
    handleChangeStreamSource
  };
}
