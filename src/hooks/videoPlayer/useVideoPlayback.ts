
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useEffect, useRef } from 'react';
import { VIDEO_PLAYER } from '@/services/config';
import { toast } from "@/hooks/use-toast";

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  // Set up core video state and refs
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useVideoSetup();

  // Create a ref to track current channel
  const currentChannelIdRef = useRef(channel.id);
  
  // Set up video playback controls
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

  // Set up retry logic
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

  // Set up video event listeners
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
  
  // إعادة تهيئة المشغل عند تغيير القناة - مبسطة
  useEffect(() => {
    console.log("Channel changed: ", channel.name);
    
    // تهيئة أساسية
    setIsLoading(true);
    setError(null);
    
    // التحقق من وجود رابط بث
    if (!channel.streamUrl) {
      console.error("Missing stream URL for channel:", channel.name);
      setError("لا يوجد رابط بث متاح لهذه القناة");
      setIsLoading(false);
      return;
    }
    
    // تحديث معرف القناة المطلوبة
    currentChannelIdRef.current = channel.id;
    
  }, [channel.id, channel.streamUrl, channel.name]);

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
