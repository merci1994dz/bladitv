
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useState } from 'react';
import { useChannelChange } from './useChannelChange';
import { useVideoReadiness } from './useVideoReadiness';
import { useVideoDebugLogs } from './useVideoDebugLogs';

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  // Set up basic video state and references
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMobile
  } = useVideoSetup();
  
  // Add state to track loading completion and connection status
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
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

  // Set up retry logic - now using our refactored modules
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

  // Use channel change handler
  useChannelChange({
    channel,
    videoRef,
    setIsLoading,
    setError,
    setIsVideoReady,
    setConnectionAttempts
  });

  // Use video readiness handler
  useVideoReadiness({
    videoRef,
    channel,
    isLoading,
    isMobile,
    isVideoReady,
    connectionAttempts,
    setIsVideoReady,
    setIsLoading,
    setError,
    setIsPlaying,
    setConnectionAttempts
  });

  // Set up core video event listeners
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
  
  // Use debug logging
  useVideoDebugLogs({
    channel,
    isMobile,
    isPlaying,
    isLoading,
    isVideoReady,
    error,
    retryCount,
    connectionAttempts
  });

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
