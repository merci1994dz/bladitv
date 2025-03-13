
import { Channel } from '@/types';
import { useVideoPlayback } from './useVideoPlayback';
import { useVideoControls } from './useVideoControls';
import { useVideoVolume } from './useVideoVolume';
import { useVideoFullscreen } from './useVideoFullscreen';
import { useEffect, useRef } from 'react';

interface UseVideoPlayerProps {
  channel: Channel;
}

export function useVideoPlayer({ channel }: UseVideoPlayerProps) {
  // مرجع لتتبع ما إذا تم تهيئة مستوى الصوت
  const volumeInitializedRef = useRef(false);
  // مرجع لتتبع معرف القناة الحالية
  const currentChannelIdRef = useRef(channel.id);
  
  // الحصول على وظائف تشغيل الفيديو
  const {
    videoRef,
    isPlaying,
    isLoading,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  } = useVideoPlayback({ channel });
  
  // الحصول على رؤية عناصر التحكم
  const {
    showControls,
    handleMouseMove
  } = useVideoControls(isPlaying);
  
  // الحصول على التحكم في الصوت
  const {
    isMuted,
    currentVolume,
    toggleMute: toggleMuteBase,
    handleVolumeChange: handleVolumeChangeBase,
    initializeVolume
  } = useVideoVolume();
  
  // الحصول على التحكم في ملء الشاشة
  const {
    isFullscreen,
    toggleFullscreen
  } = useVideoFullscreen();
  
  // تهيئة مستوى الصوت مرة واحدة فقط عندما يكون مرجع الفيديو متاحًا
  useEffect(() => {
    if (videoRef.current && !volumeInitializedRef.current) {
      initializeVolume(videoRef);
      volumeInitializedRef.current = true;
    }
  }, [videoRef, initializeVolume]);
  
  // إعادة تهيئة مستوى الصوت وتتبع تغييرات القناة
  useEffect(() => {
    if (videoRef.current) {
      // التحقق مما إذا كانت القناة قد تغيرت
      if (currentChannelIdRef.current !== channel.id) {
        currentChannelIdRef.current = channel.id;
        console.log(`تغيرت القناة إلى: ${channel.name} (${channel.id})`);
      }
      
      // تهيئة مستوى الصوت للقناة الحالية
      initializeVolume(videoRef);
    }
  }, [channel.id, initializeVolume, videoRef, channel.name]);
  
  // تغليف طرق الصوت لتبسيط استخدامها
  const toggleMute = () => toggleMuteBase(videoRef);
  const handleVolumeChange = (newVolume: number) => handleVolumeChangeBase(videoRef, newVolume);

  return {
    videoRef,
    isFullscreen,
    isMuted,
    isPlaying,
    isLoading,
    showControls,
    currentVolume,
    error,
    retryCount,
    handleMouseMove,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    retryPlayback,
    seekVideo
  };
}
