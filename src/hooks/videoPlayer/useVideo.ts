
import { useState, useRef, useMemo } from 'react';
import { useVideoSetup } from './useVideoSetup';
import { useVideoPlayback } from './useVideoPlayback';
import { useVideoVolume } from './useVideoVolume';
import { useVideoFullscreen } from './useVideoFullscreen';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoLoadHandler } from './useVideoLoadHandler';
import { useVideoEventListeners } from './useVideoEventListeners';
import { useVideoEvents } from './useVideoEvents';
import { useMobile } from '@/hooks/use-mobile';
import { Channel } from '@/types';

export const useVideo = (channel: Channel) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useMobile();

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

  // Use all video-related hooks
  const videoSetup = useVideoSetup({ 
    videoRef, 
    isLoading, 
    setIsLoading,
    error,
    setError,
    isMobile
  });
  
  const videoPlayback = useVideoPlayback({ 
    videoRef
  });
  
  const videoVolume = useVideoVolume({
    videoRef
  });
  
  const videoFullscreen = useVideoFullscreen({
    videoRef
  });
  
  const videoRetry = useVideoRetry({
    channel,
    setIsLoading,
    setError,
    videoRef
  });
  
  const videoControl = useVideoControl();
  
  const videoLoadHandler = useVideoLoadHandler({
    videoRef,
    channel,
    setIsLoading,
    setError
  });
  
  const videoEventHandlers = useMemo(() => ({
    onSeek: (seconds: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoRef.current) {
        videoRef.current.currentTime += seconds;
      }
    },
    // ... all other handlers
  }), []);
  
  // Set up event listeners
  useVideoEventListeners({
    videoRef,
    onVideoEnd: videoPlayback.handleVideoEnd,
    onVideoError: videoLoadHandler.handleVideoError,
    onVideoLoaded: videoLoadHandler.handleVideoLoaded,
    onVideoPause: videoPlayback.handleVideoPause,
    onVideoPlay: videoPlayback.handleVideoPlay
  });
  
  // Handle special TV-related events
  useVideoEvents({
    togglePlayPause: videoPlayback.togglePlayPause,
    toggleMute: videoVolume.toggleMute,
    toggleFullscreen: videoFullscreen.toggleFullscreen,
    increaseVolume: videoVolume.increaseVolume,
    decreaseVolume: videoVolume.decreaseVolume,
    seekForward: videoControl.seekForward,
    seekBackward: videoControl.seekBackward
  });

  // Clean up timeout on unmount
  const cleanup = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
  };

  return {
    videoRef,
    isLoading,
    error,
    showControls,
    setShowControls,
    handleMouseMove,
    resetControlsTimer,
    cleanup,
    ...videoSetup,
    ...videoPlayback,
    ...videoVolume,
    ...videoFullscreen,
    ...videoRetry,
    ...videoControl,
    ...videoLoadHandler,
    ...videoEventHandlers
  };
};

export default useVideo;
