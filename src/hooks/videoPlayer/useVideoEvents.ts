
import { useEffect } from 'react';
import { VideoRef, setupVideoSource } from './useVideoSetup';
import { Channel } from '@/types';

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
  // Setup video event listeners and initialize playback
  useEffect(() => {
    console.log('Initializing video player for channel:', channel.name);
    console.log('Stream URL:', channel.streamUrl);
    
    if (!videoRef.current) {
      console.error('Video ref is not available');
      return;
    }
    
    if (!channel.streamUrl) {
      console.error('Channel stream URL is empty');
      setError('لا يوجد رابط بث متاح لهذه القناة');
      setIsLoading(false);
      return;
    }
    
    // Reset states on new video
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    
    // Setup video element
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
      console.error('Video error detected:', videoElement.error);
      
      const shouldRetry = handlePlaybackError();
      
      if (shouldRetry) {
        setTimeout(() => {
          try {
            video.pause();
            video.removeAttribute('src');
            video.load();
            
            if (setupVideoSource(video, channel.streamUrl)) {
              video.load();
              video.play().catch(e => {
                console.error('Retry play failed:', e);
              });
            }
          } catch (err) {
            console.error('Error during retry attempt:', err);
          }
        }, 1500);
      }
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
    
    // Set source and play with error handling
    try {
      console.log('Setting up video source for:', channel.streamUrl);
      
      // First, clean up
      video.pause();
      video.removeAttribute('src');
      video.load();
      
      // Then set source
      if (setupVideoSource(video, channel.streamUrl)) {
        video.load();
        
        // Try playing after a small delay
        setTimeout(() => {
          if (videoRef.current) {
            console.log('Attempting to play video');
            
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('Initial play successful');
                })
                .catch(err => {
                  console.error('Error on initial play:', err);
                  
                  // If autoplay is blocked, just show controls
                  if (err.name === "NotAllowedError") {
                    console.log('Autoplay blocked - needs user interaction');
                    setIsPlaying(false);
                    setIsLoading(false);
                  }
                });
            }
          }
        }, 800); 
      }
    } catch (err) {
      console.error('Unexpected error during video initialization:', err);
      setError('حدث خطأ غير متوقع أثناء تحميل الفيديو.');
      setIsLoading(false);
    }
    
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
      
      // Cleanup video
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {
        console.error('Error during video cleanup:', e);
      }
    };
  }, [channel.streamUrl, channel.name]);
}
