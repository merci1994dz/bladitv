
import { useState, useRef, useEffect } from 'react';
import { VIDEO_PLAYER, SECURITY_CONFIG } from '@/services/config';

// Define the VideoRef type for use in other files
export type VideoRef = React.RefObject<HTMLVideoElement>;

/**
 * Sets up the video source with security measures
 * @param videoElement The video element to set up
 * @param streamUrl The URL of the stream
 * @returns boolean indicating if setup was successful
 */
export const setupVideoSource = (videoElement: HTMLVideoElement, streamUrl: string): boolean => {
  if (!streamUrl) {
    console.error('Stream URL is empty');
    return false;
  }

  try {
    // Reset video element state
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.src = '';
    videoElement.load();
    
    // Simple source setting - no obfuscation for mobile compatibility
    videoElement.src = streamUrl;
    
    // Basic mobile-friendly settings
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.setAttribute('x5-playsinline', '');
    videoElement.setAttribute('preload', 'auto');
    
    // Set mobile compatible controls attributes
    if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
      videoElement.controlsList?.add('nodownload');
    }
    
    videoElement.setAttribute('oncontextmenu', 'return false;');
    videoElement.setAttribute('disablepictureinpicture', '');
    
    // Mobile-friendly style
    videoElement.style.objectFit = 'contain';
    
    return true;
  } catch (error) {
    console.error('Error setting up video source:', error);
    return false;
  }
};

// Helper function to detect if the current device is likely a mobile device
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Hook for setting up video player state and references
 */
export function useVideoSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
    console.log("Is mobile device:", isMobileDevice());
  }, []);

  // Apply security measures on mount
  useEffect(() => {
    if (videoRef.current) {
      // Apply simple security measures to video element
      if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
        videoRef.current.controlsList?.add('nodownload');
        videoRef.current.setAttribute('oncontextmenu', 'return false;');
      }
      
      // Mobile specific settings
      if (isMobile) {
        videoRef.current.style.objectFit = 'contain';
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('webkit-playsinline', '');
        videoRef.current.setAttribute('x5-playsinline', '');
        console.log("Applied mobile-specific video settings");
      }
    }
  }, [isMobile]);

  return {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMobile
  };
}
