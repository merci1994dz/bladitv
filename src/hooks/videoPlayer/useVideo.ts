
import { useState, useRef, useMemo, useEffect } from 'react';
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoPlayback } from './useVideoPlayback';
import { useVideoVolume } from './useVideoVolume';
import { useVideoFullscreen } from './useVideoFullscreen';
import { useVideoRetry } from './useVideoRetry';
import { useIsMobile } from '@/hooks/use-mobile';

interface UseVideoHookParams {
  channel: Channel;
}

export const useVideo = (channel: Channel) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile(); // Correctly use the hook which returns a boolean

  // Video controls visibility
  const [showControls, setShowControls] = useState(true);
  
  // Handle control visibility with timeout
  const handleMouseMove = () => {
    setShowControls(true);
    resetControlsTimer();
  };

  // Auto-hide controls after a delay
  const controlsTimerRef = useRef<number | null>(null);

  const resetControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Set up video setup hooks
  const {
    isMobile: isMobileSetup
  } = useVideoSetup();
  
  // Set up video playback hooks
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
  
  // Set up video control hooks
  const {
    togglePlayPause,
    seekVideo
  } = {
    togglePlayPause: () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => {
              console.error("Error playing video:", err);
              setError("Failed to play video");
            });
        }
      }
    },
    seekVideo: (seconds: number) => {
      if (videoRef.current) {
        try {
          videoRef.current.currentTime += seconds;
        } catch (e) {
          console.error("Error seeking video:", e);
        }
      }
    }
  };
  
  // Set up volume controls
  const {
    isMuted,
    currentVolume,
    toggleMute,
    handleVolumeChange,
    initializeVolume,
    increaseVolume,
    decreaseVolume
  } = useVideoVolume();
  
  // Volume change wrapper
  const setVolume = (value: number) => {
    if (videoRef.current) {
      handleVolumeChange(videoRef, value);
    }
  };
  
  // Set up fullscreen controls
  const {
    isFullscreen,
    toggleFullscreen: toggleFullscreenBase
  } = useVideoFullscreen();
  
  // Fullscreen toggle wrapper
  const toggleFullscreen = () => {
    toggleFullscreenBase(containerRef);
  };

  // Handle Video Event Handlers
  const handleVideoEvents = () => {
    if (!videoRef.current) return;
    
    videoRef.current.onended = () => setIsPlaying(false);
    videoRef.current.onpause = () => setIsPlaying(false);
    videoRef.current.onplay = () => setIsPlaying(true);
    videoRef.current.onerror = () => {
      setError("Video playback error");
      handlePlaybackError();
    };
  };
  
  // Initialize video events on mount
  useEffect(() => {
    handleVideoEvents();
    
    if (videoRef.current) {
      initializeVolume(videoRef);
    }
    
    return () => cleanup();
  }, [videoRef.current]);

  // Cleanup function
  const cleanup = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.load();
    }
  };

  return {
    videoRef,
    containerRef,
    isLoading,
    error,
    isPlaying,
    isMuted,
    currentVolume,
    isFullscreen,
    showControls,
    retryCount,
    setShowControls,
    handleMouseMove,
    togglePlayPause,
    toggleMute,
    setVolume,
    toggleFullscreen,
    retryPlayback,
    seekVideo,
    resetControlsTimer,
    cleanup,
    increaseVolume,
    decreaseVolume
  };
};

export default useVideo;
