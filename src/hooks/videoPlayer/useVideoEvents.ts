
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

  // Setup effect - simplified for better compatibility
  useEffect(() => {
    console.log("Setting up video for channel:", channel.name, "attempt:", retryCount);
    
    // Reset states
    setError(null);
    setIsLoading(true);
    
    // Clear any existing video source
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      } catch (e) {
        console.error("Error clearing video:", e);
      }
    }
    
    // Initialize video playback with a short delay
    const timeoutId = setTimeout(() => {
      if (videoRef.current) {
        console.log("Initializing video playback after delay");
        initializeVideoPlayback(videoRef, channel, setIsLoading, setError);
      }
    }, 300);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (videoRef.current) {
        console.log("Cleaning up video element");
        try {
          // Remove event listeners first
          videoRef.current.oncanplay = null;
          videoRef.current.onplaying = null;
          videoRef.current.onerror = null;
          videoRef.current.onstalled = null;
          videoRef.current.onwaiting = null;
          videoRef.current.onended = null;
          
          // Stop and clean video
          videoRef.current.pause();
          videoRef.current.src = '';
          videoRef.current.load();
          videoRef.current.removeAttribute('src');
        } catch (e) {
          console.error("Error during video cleanup:", e);
        }
      }
    };
  }, [channel.streamUrl, retryCount]);
}
