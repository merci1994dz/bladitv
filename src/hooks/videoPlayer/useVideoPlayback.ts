
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
  // Set up core video state and refs
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMobile
  } = useVideoSetup();

  // Create a ref to track current channel
  const currentChannelRef = useRef(channel);
  
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

  // Set up retry logic - simpler for mobile
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

  // Update current channel ref when channel changes
  useEffect(() => {
    currentChannelRef.current = channel;
  }, [channel]);

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
  
  // Simple debug logging
  useEffect(() => {
    console.log("Channel info:", {
      name: channel.name,
      streamUrl: channel.streamUrl ? "Present" : "Missing",
      isMobile,
      isPlaying,
      isLoading,
      error: error || "None"
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
