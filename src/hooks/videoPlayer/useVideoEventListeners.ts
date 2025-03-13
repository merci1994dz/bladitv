
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';
import { VIDEO_PLAYER } from '@/services/config';

export function useVideoEventListeners({
  videoRef,
  setIsPlaying,
  setIsLoading,
  setError,
  handlePlaybackError
}: {
  videoRef: VideoRef;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handlePlaybackError: () => boolean;
}) {
  // Setup event listeners for video element
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // Register event listeners
    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoading(false);
    };
    
    const handlePlaying = () => {
      console.log('Video is playing');
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      
      // Secure error logging - hide actual URLs
      if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
        console.error('Video error detected:', 
          videoElement.error ? 
          { code: videoElement.error.code, message: videoElement.error.message.replace(/(https?:\/\/[^\s]+)/g, '[محمي]') } : 
          'Unknown error'
        );
      } else {
        console.error('Video error detected:', videoElement.error);
      }
      
      // Always retry at least once automatically
      handlePlaybackError();
    };
    
    const handleStalled = () => {
      console.log('Video stalled');
      setIsLoading(true);
    };
    
    const handleWaiting = () => {
      console.log('Video waiting');
      setIsLoading(true);
    };
    
    const handleEnded = () => {
      console.log('Video ended');
      setIsPlaying(false);
    };

    // Register all event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up video player');
      
      // Remove all event listeners
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
      
      // Clean up video element
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {
        console.error('Error during video cleanup:', e);
      }
    };
  }, [videoRef, setIsPlaying, setIsLoading, setError, handlePlaybackError]);
}
