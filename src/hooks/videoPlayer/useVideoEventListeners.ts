
import { useEffect } from 'react';
import { VideoRef } from './useVideoSetup';

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
    
    // Simplified event handlers
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
    
    const handleError = () => {
      console.error('Video error occurred');
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

    // Add listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    
    // Cleanup function
    return () => {
      // Remove listeners
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
      
      // Basic video cleanup
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    };
  }, [videoRef, setIsPlaying, setIsLoading, setError, handlePlaybackError]);
}
