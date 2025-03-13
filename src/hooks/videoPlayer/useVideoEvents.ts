
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
import { useVideoLoadHandler } from './useVideoLoadHandler';
import { useVideoEventListeners } from './useVideoEventListeners';

export function useVideoEvents({
  videoRef,
  channel,
  isPlaying,
  setIsPlaying,
  setIsLoading,
  setError,
  retryCount,
  handlePlaybackError
}: {
  videoRef: VideoRef;
  channel: Channel;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  retryCount: number;
  handlePlaybackError: () => boolean;
}) {
  const { initializeVideoPlayback } = useVideoLoadHandler();
  
  // Register video event listeners
  useVideoEventListeners({
    videoRef,
    setIsPlaying,
    setIsLoading,
    setError,
    handlePlaybackError
  });

  // Simplified setup effect
  useEffect(() => {
    console.log("Setting up video for channel:", channel.name, "attempt:", retryCount);
    
    // Reset states
    setError(null);
    setIsLoading(true);
    
    // Initialize video playback with short delay to allow cleanup
    setTimeout(() => {
      initializeVideoPlayback(videoRef, channel, setIsLoading, setError);
    }, 300);
    
  }, [channel.streamUrl, retryCount]);
}
