
import { useState, useRef, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Channel } from '@/types';

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false); // بداية بحالة إيقاف
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
          });
      }
    }
  };

  // HLS setup for better support
  const setupHlsIfNeeded = (video: HTMLVideoElement, src: string) => {
    if (!src) {
      console.error('Stream URL is empty or invalid');
      setError('رابط البث غير صالح. الرجاء المحاولة لاحقًا.');
      setIsLoading(false);
      return false;
    }

    console.log('Setting up video with source:', src);
    
    try {
      // Set source directly
      video.src = src;
      return true;
    } catch (e) {
      console.error('Error setting video source:', e);
      setError('حدث خطأ أثناء تحميل الفيديو. الرجاء المحاولة لاحقًا.');
      setIsLoading(false);
      return false;
    }
  };

  // Retry playback after error
  const retryPlayback = () => {
    console.log("Retrying playback manually");
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    if (videoRef.current) {
      // Reset completely
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // Set new source with a slight delay
      setTimeout(() => {
        if (videoRef.current) {
          if (setupHlsIfNeeded(videoRef.current, channel.streamUrl)) {
            videoRef.current.load();
            
            // Try to play
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Manual retry successful");
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(err => {
                  console.error('Error playing video on retry:', err);
                  setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
                  setIsLoading(false);
                });
            }
          }
        }
      }, 500);
    }
  };
  
  // Seek video function
  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      try {
        videoRef.current.currentTime += seconds;
      } catch (error) {
        console.error('Error seeking in video:', error);
        // Many live streams don't support seeking, so just ignore the error
      }
    }
  };

  // Initialize video player
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
    setRetryCount(0);
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
      
      // Only increment retry count if there's a real error
      if (retryCount < maxRetries) {
        console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          try {
            video.pause();
            video.removeAttribute('src');
            video.load();
            
            if (setupHlsIfNeeded(video, channel.streamUrl)) {
              video.load();
              video.play().catch(e => {
                console.error('Retry play failed:', e);
              });
            }
          } catch (err) {
            console.error('Error during retry attempt:', err);
          }
        }, 1500);
      } else {
        setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى لاحقًا.');
        setIsLoading(false);
        setIsPlaying(false);
        
        toast({
          title: "تنبيه",
          description: `فشل في تشغيل القناة ${channel.name}. يرجى التحقق من اتصالك بالإنترنت.`,
          variant: "destructive",
        });
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
      if (setupHlsIfNeeded(video, channel.streamUrl)) {
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
        }, 800); // زيادة التأخير قليلاً
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

  return {
    videoRef,
    isPlaying,
    isLoading,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  };
}
