
import { useState, useRef, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Channel } from '@/types';

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
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
      return;
    }

    console.log('Setting up video with source:', src);
    
    // If browser has native HLS support
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('Native HLS support detected');
      video.src = src;
      return;
    }
    
    // For browsers without native HLS support
    console.log('No HLS support, trying direct playback');
    
    try {
      video.src = src;
      video.onerror = (e) => {
        console.error('Video error during setup:', e);
      };
    } catch (e) {
      console.error('Error setting video source:', e);
      setError('حدث خطأ أثناء تحميل الفيديو. الرجاء المحاولة لاحقًا.');
      setIsLoading(false);
    }
  };

  // Method to try alternative formats
  const tryAlternativeFormats = async () => {
    if (!videoRef.current || !channel.streamUrl) return;
    
    console.log('Trying alternative format for:', channel.streamUrl);
    
    // Reset video state
    const video = videoRef.current;
    video.pause();
    video.removeAttribute('src');
    video.load();
    
    // Try with the original source
    try {
      setupHlsIfNeeded(video, channel.streamUrl);
      
      await video.play().catch(e => {
        console.error('Error playing video with original source:', e);
        setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى لاحقًا.');
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Complete failure in tryAlternativeFormats:', err);
      setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى لاحقًا.');
      setIsLoading(false);
    }
  };

  // Retry playback after error
  const retryPlayback = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    if (videoRef.current) {
      // Reset completely
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // Set new source
      setupHlsIfNeeded(videoRef.current, channel.streamUrl);
      videoRef.current.load();
      
      // Try to play
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error playing video on retry:', err);
            
            // If video format error persists, try alternative formats
            if (err.name === "NotSupportedError") {
              tryAlternativeFormats();
            } else {
              setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
              setIsLoading(false);
            }
          });
      }
    }
  };
  
  // Seek video (for live streams this might not work)
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
    
    // Setup video element
    const video = videoRef.current;
    
    // Log events for diagnostics
    console.log('Setting up video event listeners');
    
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
      console.error('Error code:', videoElement.error?.code);
      console.error('Error message:', videoElement.error?.message);
      
      // Only increment retry count if there's a real error (not abort)
      if (retryCount < maxRetries) {
        console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          // Use a slightly different approach for retrying
          try {
            video.removeAttribute('src');
            video.load();
            setupHlsIfNeeded(video, channel.streamUrl);
            video.load();
            
            const playPromise = video.play().catch(e => {
              console.error('Retry play failed:', e);
              
              // Check if it's a format error - this is often not recoverable
              if (e.name === "NotSupportedError") {
                setError('فشل في تشغيل البث. تنسيق الفيديو غير مدعوم في متصفحك.');
                setIsLoading(false);
              }
            });
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
      setupHlsIfNeeded(video, channel.streamUrl);
      
      // Try playing after a small delay
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Attempting to play video');
          videoRef.current.load();
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Initial play successful');
              })
              .catch(err => {
                console.error('Error on initial play:', err);
                console.error('Error name:', err.name);
                console.error('Error message:', err.message);
                
                // Check if it's a user interaction error
                if (err.name === "NotAllowedError") {
                  console.log('Autoplay blocked by browser - needs user interaction');
                  setIsPlaying(false);
                  setIsLoading(false);
                }
                // For format errors, set the appropriate error
                else if (err.name === "NotSupportedError") {
                  setError('تنسيق الفيديو غير مدعوم في متصفحك.');
                  setIsLoading(false);
                  // Try playing with alternative format
                  tryAlternativeFormats();
                }
              });
          }
        }
      }, 500);
    } catch (err) {
      console.error('Unexpected error during video initialization:', err);
      setError('حدث خطأ غير متوقع أثناء تحميل الفيديو.');
      setIsLoading(false);
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up video player');
      
      // First remove all event listeners to prevent errors during cleanup
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
      
      // Then handle the video properly
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {
        console.error('Error during video cleanup:', e);
      }
    };
  }, [channel.streamUrl, channel.name, retryCount]);

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
