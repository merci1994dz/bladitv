
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
    // Apply security measures for video playback
    if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
      videoElement.controlsList?.add('nodownload');
    }

    // Prevent saving video
    videoElement.setAttribute('oncontextmenu', 'return false;');

    // Set the source
    const shouldObfuscate = VIDEO_PLAYER.OBFUSCATE_SOURCE;
    
    if (shouldObfuscate) {
      // This is a simple obfuscation that won't prevent determined users
      // but adds a layer of difficulty for casual inspection
      videoElement.src = streamUrl;
    } else {
      // Normal source setting
      videoElement.src = streamUrl;
    }

    // Set referrer policy if enabled
    if (VIDEO_PLAYER.REFERRER_PROTECTION) {
      videoElement.setAttribute('referrerpolicy', 'no-referrer');
    }

    return true;
  } catch (error) {
    console.error('Error setting up video source:', error);
    return false;
  }
};

/**
 * Hook for setting up video player state and references
 */
export function useVideoSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply security measures on mount
  useEffect(() => {
    if (videoRef.current) {
      // Disable right click on video element if specified in config
      if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
        videoRef.current.controlsList?.add('nodownload');
        videoRef.current.setAttribute('oncontextmenu', 'return false;');
      }
    }
  }, []);

  return {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}
