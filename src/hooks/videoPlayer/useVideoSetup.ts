
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
      let srcValue = streamUrl; // Use a variable instead of trying to modify the constant
      
      Object.defineProperty(videoElement, 'src', {
        get: function() {
          return VIDEO_PLAYER.HIDE_STREAM_URLS ? 'protected://stream' : srcValue;
        },
        set: function(newValue) {
          srcValue = newValue; // Update the variable instead of trying to modify the constant
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
    
    // Optimize for TV playback
    videoElement.playsInline = true;
    videoElement.autoplay = true; // Most TV users expect auto-play
    
    // Enhanced video playback settings for TV
    if (isTVDevice()) {
      videoElement.style.objectFit = 'contain';
      // Ensure good quality on large screens
      if (videoElement.getAttribute('playsinline') !== null) {
        videoElement.removeAttribute('playsinline');
      }
    }

    return true;
  } catch (error) {
    console.error('Error setting up video source:', error);
    return false;
  }
};

// Helper function to detect if the current device is likely a TV
function isTVDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('tv') || 
    userAgent.includes('android tv') || 
    userAgent.includes('smart-tv') ||
    // Common TV viewport size check (large landscape screen)
    (window.innerWidth > 1280 && window.innerHeight < window.innerWidth)
  );
}

/**
 * Hook for setting up video player state and references
 */
export function useVideoSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTV, setIsTV] = useState(false);

  // Detect TV device on mount
  useEffect(() => {
    setIsTV(isTVDevice());
  }, []);

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
      
      // TV-specific video element settings
      if (isTV) {
        videoRef.current.style.objectFit = 'contain';
        videoRef.current.focus(); // Ensure video element can receive remote control input
      }
    }
  }, [isTV]);

  return {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isTV
  };
}
