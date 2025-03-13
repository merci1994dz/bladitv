
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
import { VIDEO_PLAYER } from '@/services/config';
import { setupVideoSource } from './useVideoSetup';

export function useVideoLoadHandler() {
  const initializeVideoPlayback = (
    videoRef: VideoRef,
    channel: Channel,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) => {
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
    
    // Secure logging - hide actual URLs in console
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      console.log('Initializing video player for channel:', channel.name);
      console.log('Stream URL:', '[محمي]');
    } else {
      console.log('Initializing video player for channel:', channel.name);
      console.log('Stream URL:', channel.streamUrl);
    }
    
    // Set up new source and attempt playback with enhanced security
    try {
      // First, clean up existing media
      const video = videoRef.current;
      video.pause();
      video.removeAttribute('src');
      video.load();
      
      if (setupVideoSource(video, channel.streamUrl)) {
        video.load();
        
        // Add a small delay to allow the browser to load the video
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
                  // Secure error logging
                  if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
                    console.error('Error on initial play:', err instanceof Error ? err.message.replace(/(https?:\/\/[^\s]+)/g, '[محمي]') : 'Unknown error');
                  } else {
                    console.error('Error on initial play:', err);
                  }
                  
                  // If autoplay is blocked, just show controls
                  if (err.name === "NotAllowedError") {
                    console.log('Autoplay blocked - needs user interaction');
                  }
                });
            }
          }
        }, 800);
      }
    } catch (err) {
      // Secure error logging
      if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
        console.error('Unexpected error during video initialization:', err instanceof Error ? err.message.replace(/(https?:\/\/[^\s]+)/g, '[محمي]') : 'Unknown error');
      } else {
        console.error('Unexpected error during video initialization:', err);
      }
      
      setError('حدث خطأ غير متوقع أثناء تحميل الفيديو.');
      setIsLoading(false);
    }
  };

  return { initializeVideoPlayback };
}
