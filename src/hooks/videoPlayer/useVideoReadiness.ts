
import { useEffect } from 'react';
import { Channel } from '@/types';

interface UseVideoReadinessProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  channel: Channel;
  isLoading: boolean;
  isMobile: boolean;
  isVideoReady: boolean;
  connectionAttempts: number;
  setIsVideoReady: (ready: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setConnectionAttempts: (callback: (prev: number) => number) => void;
}

export function useVideoReadiness({
  videoRef,
  channel,
  isLoading,
  isMobile,
  isVideoReady,
  connectionAttempts,
  setIsVideoReady,
  setIsLoading,
  setError,
  setIsPlaying,
  setConnectionAttempts
}: UseVideoReadinessProps) {
  
  // Add event handler for canplay with additional compatibility options
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleCanPlay = () => {
      console.log("الفيديو جاهز للتشغيل (canplay)");
      setIsVideoReady(true);
      setIsLoading(false);
      
      // Attempt autoplay
      if (videoElement) {
        videoElement.play()
          .then(() => {
            setIsPlaying(true);
            console.log("تم تشغيل الفيديو تلقائيًا بعد canplay");
          })
          .catch((err) => {
            // Autoplay might be prohibited on some browsers
            console.log("خطأ في التشغيل التلقائي بعد canplay:", err);
            
            // Don't consider this an error - user may need to interact
            if (err.name === 'NotAllowedError') {
              console.log("التشغيل التلقائي ممنوع، بانتظار تفاعل المستخدم");
              setError('انقر للتشغيل');
              
              // Alternative attempt with mute
              try {
                videoElement.muted = true;
                videoElement.play().then(() => {
                  // Add click listener to unmute
                  const unmuteOnClick = () => {
                    videoElement.muted = false;
                    setError(null);
                    document.body.removeEventListener('click', unmuteOnClick);
                  };
                  document.body.addEventListener('click', unmuteOnClick, { once: true });
                }).catch(e => {
                  console.log("فشلت محاولة التشغيل الصامت:", e);
                });
              } catch (e) {
                console.error("خطأ في محاولة التشغيل الصامت:", e);
              }
            }
          });
      }
    };
    
    // Add additional handler for continuous loading (for mobile devices)
    const handleLoadedData = () => {
      console.log("تم تحميل بيانات الفيديو (loadeddata)");
      
      // Mobile-specific - improve loading experience
      if (isMobile) {
        setTimeout(() => {
          setIsVideoReady(true);
          setIsLoading(false);
        }, 300);
      }
    };
    
    // Stream progress handler to handle resuming playback after pause
    const handleProgress = () => {
      if (isLoading && videoElement && videoElement.readyState >= 3) {
        console.log("تقدم التحميل كافٍ للتشغيل");
        setIsLoading(false);
      }
    };
    
    // New handler for stream loading errors
    const handleLoadError = () => {
      setConnectionAttempts(prev => {
        const newCount = prev + 1;
        console.log(`محاولة اتصال ${newCount}`);
        
        if (newCount >= 3 && !isVideoReady) {
          setError("تعذر الاتصال بخادم البث");
        }
        
        return newCount;
      });
    };
    
    // Add timer to check connection success
    const connectionTimeout = setTimeout(() => {
      if (!isVideoReady && videoElement && videoElement.readyState < 3) {
        console.warn("تجاوز مهلة الاتصال - إعادة تحميل تلقائية");
        handleLoadError();
        
        if (connectionAttempts < 2) {
          // Auto-reload video
          if (videoElement) {
            try {
              videoElement.load();
            } catch (e) {
              console.error("خطأ في إعادة تحميل الفيديو:", e);
            }
          }
        }
      }
    }, 8000);
    
    if (videoElement) {
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('progress', handleProgress);
      
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('progress', handleProgress);
        clearTimeout(connectionTimeout);
      };
    }
    
    return () => {
      clearTimeout(connectionTimeout);
    };
  }, [
    videoRef, 
    setIsLoading, 
    setIsPlaying, 
    isMobile, 
    isLoading, 
    isVideoReady, 
    connectionAttempts, 
    setIsVideoReady, 
    setError, 
    setConnectionAttempts
  ]);
}
