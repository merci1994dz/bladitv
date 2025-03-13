import { useState, useRef, useEffect } from 'react';
import { Channel } from '@/types';
import { toast } from "@/hooks/use-toast";

interface UseVideoPlayerProps {
  channel: Channel;
}

export function useVideoPlayer({ channel }: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentVolume, setCurrentVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Set new timeout to hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // التعامل مع ملفات M3U8 بطريقة HLS للدعم الأفضل
  const setupHlsIfNeeded = (video: HTMLVideoElement, src: string) => {
    if (!src) {
      console.error('Stream URL is empty or invalid');
      setError('رابط البث غير صالح. الرجاء المحاولة لاحقًا.');
      setIsLoading(false);
      return;
    }

    console.log('Setting up video with source:', src);
    
    // إذا كان المتصفح يدعم HLS بشكل مدمج
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('Native HLS support detected');
      video.src = src;
      return;
    }
    
    // للمتصفحات التي لا تدعم HLS بشكل مدمج، نستخدم الملفات المدعومة فقط
    console.log('No HLS support, trying direct playback');
    
    // تجربة بعض الخيارات الإضافية لزيادة التوافق
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

  // طريقة جديدة لتحسين التعامل مع الأخطاء وتجربة أنواع مختلفة من صيغ الفيديو
  const tryAlternativeFormats = async () => {
    if (!videoRef.current || !channel.streamUrl) return;
    
    // سجل المحاولة
    console.log('Trying alternative format for:', channel.streamUrl);
    
    // إعادة تعيين حالة الفيديو
    const video = videoRef.current;
    video.pause();
    video.removeAttribute('src');
    video.load();
    
    // محاولة مع المصدر الأصلي
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
    video.muted = isMuted;
    video.volume = currentVolume;
    
    // تسجيل الأحداث للتشخيص
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
                  // محاولة تشغيل بصيغة بديلة
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
      
      // Clear any timeouts
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Exit fullscreen on unmount if needed
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.error('Error exiting fullscreen:', e));
      }
    };
  }, [channel.streamUrl, channel.name, currentVolume, isMuted, retryCount]);

  // Handle play/pause
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

  // Handle fullscreen toggle
  const toggleFullscreen = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Keep controls visible for a bit after entering fullscreen
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, 3000);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
        toast({
          title: "تنبيه",
          description: "تعذر تفعيل وضع ملء الشاشة.",
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      // Always show controls in windowed mode
      setShowControls(true);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting, restore to previous volume
      if (!newMutedState && videoRef.current.volume === 0) {
        videoRef.current.volume = currentVolume || 0.5;
      }
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setCurrentVolume(newVolume);
      
      // If volume is 0, mute; otherwise ensure it's unmuted
      if (newVolume === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Retry playing after error
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
            
            // إذا استمر الخطأ في تنسيق الفيديو، جرب الصيغ البديلة
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

  // Rewind and fast forward (if applicable for the stream)
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

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    videoRef,
    isFullscreen,
    isMuted,
    isPlaying,
    isLoading,
    showControls,
    currentVolume,
    error,
    retryCount,
    handleMouseMove,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    retryPlayback,
    seekVideo
  };
}
