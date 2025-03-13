
import { useState, useRef, useEffect } from 'react';

export function useVideoControls(isPlaying: boolean) {
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showControls, setShowControls] = useState(true);
  const userActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserActive, setIsUserActive] = useState(true);

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    setIsUserActive(true);
    
    // Clear existing timeouts
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (userActivityTimeoutRef.current) {
      clearTimeout(userActivityTimeoutRef.current);
    }
    
    // Set user inactivity timeout
    userActivityTimeoutRef.current = setTimeout(() => {
      setIsUserActive(false);
    }, 2500);
    
    // Set new timeout to hide controls after 3 seconds if video is playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isUserActive) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  // Show controls when video pauses
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else if (isPlaying && !showControls) {
      // Briefly show controls when playback starts
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  }, [isPlaying]);

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Always show controls when entering or exiting fullscreen
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Hide controls after delay if video is playing
      if (isPlaying && document.fullscreenElement) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show controls on any key press
      setShowControls(true);
      setIsUserActive(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      // Clear any timeouts
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (userActivityTimeoutRef.current) {
        clearTimeout(userActivityTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  return {
    showControls,
    handleMouseMove,
    isUserActive
  };
}
