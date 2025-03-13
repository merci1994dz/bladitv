
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useEffect, useRef } from 'react';
import { VIDEO_PLAYER } from '@/services/config';

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  // منع تسريب روابط البث عبر console logs
  const secureChannel = VIDEO_PLAYER.HIDE_STREAM_URLS ? {
    ...channel,
    streamUrl: channel.streamUrl // الحقيقي يبقى للاستخدام الداخلي فقط
  } : channel;

  // Set up core video state and refs
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useVideoSetup();

  // Create a ref to keep track of current channel ID
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
    channel: secureChannel,
    setIsLoading,
    setError,
    setIsPlaying
  });

  // Set up video event listeners
  useVideoEvents({
    videoRef,
    channel: secureChannel,
    isPlaying,
    setIsPlaying,
    setIsLoading,
    setError,
    retryCount,
    handlePlaybackError
  });
  
  // Reset state when channel changes
  useEffect(() => {
    // Only reset if the channel ID actually changed
    if (currentChannelIdRef.current !== channel.id) {
      currentChannelIdRef.current = channel.id;
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);
      
      // Try to play the new channel after a short delay
      const timer = setTimeout(() => {
        if (videoRef.current) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Failed to auto-play new channel:', err);
            });
          }
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [channel.id, setIsLoading, setError, setIsPlaying, videoRef]);

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
