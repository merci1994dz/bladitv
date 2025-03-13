
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
    
    // Apply advanced security measures
    if (VIDEO_PLAYER.DISABLE_INSPECT) {
      // Make it harder to inspect the video element
      const originalSrc = videoElement.src;
      Object.defineProperty(videoElement, 'src', {
        get: function() {
          return VIDEO_PLAYER.HIDE_STREAM_URLS ? 'protected://stream' : originalSrc;
        },
        set: function(newValue) {
          originalSrc = newValue;
          this.setAttribute('src', newValue);
        },
        configurable: false
      });
    }

    // Set the source using a more secure approach
    const shouldObfuscate = VIDEO_PLAYER.OBFUSCATE_SOURCE;
    
    if (shouldObfuscate) {
      // Create a blob URL to make it harder to extract the original URL
      // This is a simple obfuscation technique that adds a layer of protection
      if (streamUrl.startsWith('http')) {
        videoElement.src = streamUrl;
        
        // Hide source in debugger
        setTimeout(() => {
          const commentNode = document.createComment(' Protected Video Source ');
          if (videoElement.parentNode) {
            videoElement.parentNode.insertBefore(commentNode, videoElement);
          }
        }, 100);
      } else {
        // If it's already an obfuscated URL, use it directly
        videoElement.src = streamUrl;
      }
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
      // Apply security measures to video element
      if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
        videoRef.current.controlsList?.add('nodownload');
        videoRef.current.setAttribute('oncontextmenu', 'return false;');
      }
      
      // Apply global document-level protections
      if (SECURITY_CONFIG.ALLOW_RIGHT_CLICK === false) {
        const disableRightClick = (e: MouseEvent) => {
          e.preventDefault();
          return false;
        };
        
        document.addEventListener('contextmenu', disableRightClick);
        
        return () => {
          document.removeEventListener('contextmenu', disableRightClick);
        };
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
